const asyncHandler = require('../middleware/asyncHandler');
const Transaction = require('../models/Transaction');   
const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

// @desc    Get all transactions for the logged in user
// @route   GET /api/v1/transactions
// @access  Private

exports.getTransactions = asyncHandler(async (req, res, next) => {
  // Pagination — defaults keep behavior close to before (most users won't
  // notice anything changed) but caps the response so it stays fast as data grows.
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find({ userId: req.user.id })
      .populate({
        path: 'categoryId',
        select: 'name type icon color' // Only get the fields we need from the category
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments({ userId: req.user.id })
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data: transactions
  });
});

// @desc    Get single transaction
// @route   GET /api/v1/transactions/:id
// @access  Private
exports.getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate({
      path: 'categoryId',
      select: 'name type icon color'
    });

  if (!transaction) {
    return next(new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404));
  }

  // Make sure the transaction belongs to the user
  if (transaction.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to access this transaction`, 401));
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Create new transaction
// @route   POST /api/v1/transactions
// @access  Private
exports.createTransaction = asyncHandler(async (req, res, next) => {
  // Add the user ID to the request body
  req.body.userId = req.user.id;

  // If a categoryId is provided, verify that the category belongs to the user
  if (req.body.categoryId) {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return next(new ErrorResponse(`Category not found with id of ${req.body.categoryId}`, 404));
    }
    // Check that the category belongs to the user
    if (category.userId.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to use this category`, 401));
    }
    // Optionally, check that the transaction type matches the category type
    if (req.body.type && req.body.type !== category.type) {
      return next(new ErrorResponse(`Transaction type must match category type`, 400));
    }
  }

  const transaction = await Transaction.create(req.body);

  res.status(201).json({
    success: true,
    data: transaction
  });
});


exports.updateTransaction = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404));
  }

  // Make sure the transaction belongs to the user
  if (transaction.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this transaction`, 401));
  }

  // If categoryId is being updated, validate it
  if (req.body.categoryId) {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return next(new ErrorResponse(`Category not found with id of ${req.body.categoryId}`, 404));
    }
    if (category.userId.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to use this category`, 401));
    }
    // If type is being updated, check against category type; if not, use existing transaction type
    const typeToCheck = req.body.type || transaction.type;
    if (typeToCheck !== category.type) {
      return next(new ErrorResponse(`Transaction type must match category type`, 400));
    }
  }

    // Never let the update payload change ownership of the resource, even
  // for the owner's own request — userId is set once at creation only.
  delete req.body.userId;
  
  transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate({
    path: 'categoryId',
    select: 'name type icon color'
  });

  res.status(200).json({
    success: true,
    data: transaction
  });
});


exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404));
  }

  // Make sure the transaction belongs to the user
  if (transaction.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this transaction`, 401));
  }

  await transaction.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload a receipt/screenshot for a transaction (adds to attachments)
// @route   POST /api/v1/transactions/:id/attachments
// @access  Private
exports.uploadTransactionAttachment = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404));
  }

  if (transaction.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this transaction`, 401));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  const secureUrl = await uploadToCloudinary(req.file.buffer, 'expense-tracker/receipts');

  transaction.attachments.push(secureUrl);
  await transaction.save();

  res.status(200).json({
    success: true,
    data: transaction
  });
});