const asyncHandler = require('../middleware/asyncHandler');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const ErrorResponse = require('../utils/errorResponse');

// Helper: calculate spent amount for a budget (by summing matching transactions)
const calculateSpent = async (budgetId) => {
  const budget = await Budget.findById(budgetId);
  if (!budget) return 0;

  const match = { userId: budget.userId };

  // Date range
  if (budget.startDate && budget.endDate) {
    match.date = { $gte: budget.startDate, $lte: budget.endDate };
  }

  // Type: we assume budgets are for expenses; you can make this configurable
  match.type = 'expense';

  // Category filter (if set)
  if (budget.categoryId) {
    match.categoryId = budget.categoryId;
  }

  const agg = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return agg.length > 0 ? agg[0].total : 0;
};

// @desc    Get all budgets for the logged in user
// @route   GET /api/v1/budgets
// @access  Private
exports.getBudgets = asyncHandler(async (req, res, next) => {
  const budgets = await Budget.find({ userId: req.user.id })
    .populate('categoryId', 'name type icon color')
    .sort({ createdAt: -1 });

  // Attach calculated spent & remaining
  const budgetsWithStats = await Promise.all(
    budgets.map(async (b) => {
      const spent = await calculateSpent(b._id);
      return {
        ...b.toObject(),
        spent,
        remaining: Math.max(b.amount - spent, 0),
        percentSpent: b.amount ? ((spent / b.amount) * 100).toFixed(2) : 0,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: budgetsWithStats.length,
    data: budgetsWithStats,
  });
});

// @desc    Get single budget
// @route   GET /api/v1/budgets/:id
// @access  Private
exports.getBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findById(req.params.id)
    .populate('categoryId', 'name type icon color');

  if (!budget) {
    return next(new ErrorResponse(`Budget not found with id ${req.params.id}`, 404));
  }
  if (budget.userId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this budget', 401));
  }

  const spent = await calculateSpent(budget._id);
  res.status(200).json({
    success: true,
    data: {
      ...budget.toObject(),
      spent,
      remaining: Math.max(budget.amount - spent, 0),
      percentSpent: budget.amount ? ((spent / budget.amount) * 100).toFixed(2) : 0,
    },
  });
});

// @desc    Create new budget
// @route   POST /api/v1/budgets
// @access  Private
exports.createBudget = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user.id;

  // Optional: validate category ownership if supplied
  if (req.body.categoryId) {
    const cat = await Category.findById(req.body.categoryId);
    if (!cat) return next(new ErrorResponse('Category not found', 404));
    if (cat.userId.toString() !== req.user.id)
      return next(new ErrorResponse('Not authorized to use this category', 401));
  }

  const budget = await Budget.create(req.body);
  res.status(201).json({ success: true, data: budget });
});

// @desc    Update budget
// @route   PUT /api/v1/budgets/:id
// @access  Private
exports.updateBudget = asyncHandler(async (req, res, next) => {
  let budget = await Budget.findById(req.params.id);
  if (!budget)
    return next(new ErrorResponse(`Budget not found with id ${req.params.id}`, 404));
  if (budget.userId.toString() !== req.user.id)
    return next(new ErrorResponse('Not authorized to update this budget', 401));

  // If categoryId is being changed, validate ownership
  if (req.body.categoryId && req.body.categoryId !== budget.categoryId?.toString()) {
    const cat = await Category.findById(req.body.categoryId);
    if (!cat) return next(new ErrorResponse('Category not found', 404));
    if (cat.userId.toString() !== req.user.id)
      return next(new ErrorResponse('Not authorized to use this category', 401));
  }

  budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('categoryId', 'name type icon color');

  res.status(200).json({ success: true, data: budget });
});

// @desc    Delete budget
// @route   DELETE /api/v1/budgets/:id
// @access  Private
exports.deleteBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findById(req.params.id);
  if (!budget)
    return next(new ErrorResponse(`Budget not found with id ${req.params.id}`, 404));
  if (budget.userId.toString() !== req.user.id)
    return next(new ErrorResponse('Not authorized to delete this budget', 401));

  await budget.remove();
  res.status(200).json({ success: true, data: {} });
});