const asyncHandler = require('../middleware/asyncHandler');
const Bill = require('../models/Bill');
const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');

// @desc Get all bills for the logged in user
// @route GET /api/v1/bills
// @access Private
exports.getBills = asyncHandler(async (req, res, next) => {
  const bills = await Bill.find({ userId: req.user.id })
    .populate('categoryId', 'name type icon color')
    .sort({ dueDate: 1 });

  // Add status to each bill: overdue, upcoming, pending
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfSevenDaysLater = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7, 23, 59, 59, 999));

  const billsWithStatus = bills.map(bill => {
    const billObj = bill.toObject();
    if (billObj.paid) {
      billObj.status = 'paid';
    } else {
      const dueDate = new Date(billObj.dueDate);
      if (dueDate < startOfToday) {
        billObj.status = 'overdue';
      } else if (dueDate <= endOfSevenDaysLater) {
        billObj.status = 'upcoming';
      } else {
        billObj.status = 'pending';
      }
    }
    return billObj;
  });

  res.status(200).json({
    success: true,
    count: billsWithStatus.length,
    data: billsWithStatus,
  });
});

// @desc Get single bill
// @route GET /api/v1/bills/:id
// @access Private
exports.getBill = asyncHandler(async (req, res, next) => {
  const bill = await Bill.findById(req.params.id)
    .populate('categoryId', 'name type icon color');

  if (!bill) {
    return next(new ErrorResponse(`Bill not found with id ${req.params.id}`, 404));
  }
  if (bill.userId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this bill', 401));
  }
  res.status(200).json({ success: true, data: bill });
});

// @desc Create new bill
// @route POST /api/v1/bills
// @access Private
exports.createBill = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user.id;

  if (req.body.categoryId) {
    const cat = await Category.findById(req.body.categoryId);
    if (!cat) return next(new ErrorResponse('Category not found', 404));
    if (cat.userId.toString() !== req.user.id)
      return next(new ErrorResponse('Not authorized to use this category', 401));
  }

  const bill = await Bill.create(req.body);
  res.status(201).json({ success: true, data: bill });
});

// @desc Update bill
// @route PUT /api/v1/bills/:id
// @access Private
exports.updateBill = asyncHandler(async (req, res, next) => {
  let bill = await Bill.findById(req.params.id);
  if (!bill)
    return next(new ErrorResponse(`Bill not found with id ${req.params.id}`, 404));
  if (bill.userId.toString() !== req.user.id)
    return next(new ErrorResponse('Not authorized to update this bill', 401));

  if (req.body.categoryId && req.body.categoryId !== bill.categoryId?.toString()) {
    const cat = await Category.findById(req.body.categoryId);
    if (!cat) return next(new ErrorResponse('Category not found', 404));
    if (cat.userId.toString() !== req.user.id)
      return next(new ErrorResponse('Not authorized to use this category', 401));
  }

  bill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('categoryId', 'name type icon color');

  res.status(200).json({ success: true, data: bill });
});

// @desc Delete bill
// @route DELETE /api/v1/bills/:id
// @access Private
exports.deleteBill = asyncHandler(async (req, res, next) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill)
    return next(new ErrorResponse(`Bill not found with id ${req.params.id}`, 404));
  if (bill.userId.toString() !== req.user.id)
    return next(new ErrorResponse('Not authorized to delete this bill', 401));

  await bill.remove();
  res.status(200).json({ success: true, data: {} });
});