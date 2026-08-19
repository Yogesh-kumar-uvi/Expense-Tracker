const asyncHandler = require('../middleware/asyncHandler');
const Goal = require('../models/Goal');
const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all goals for the logged in user
// @route   GET /api/v1/goals
// @access  Private
exports.getGoals = asyncHandler(async (req, res, next) => {
  const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: goals.length,
    data: goals
  });
});

// @desc    Get single goal
// @route   GET /api/v1/goals/:id
// @access  Private
exports.getGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    return next(new ErrorResponse(`Goal not found with id ${req.params.id}`, 404));
  }
  if (goal.userId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this goal', 401));
  }
  res.status(200).json({
    success: true,
    data: goal
  });
});

// @desc    Create new goal
// @route   POST /api/v1/goals
// @access  Private
exports.createGoal = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user.id;

  // Optional: validate category ownership if supplied
  if (req.body.categoryId) {
    const cat = await Category.findById(req.body.categoryId);
    if (!cat) return next(new ErrorResponse('Category not found', 404));
    if (cat.userId.toString() !== req.user.id)
      return next(new ErrorResponse('Not authorized to use this category', 401));
  }

  const goal = await Goal.create(req.body);
  res.status(201).json({ success: true, data: goal });
});

// @desc    Update goal
// @route   PUT /api/v1/goals/:id
// @access  Private
exports.updateGoal = asyncHandler(async (req, res, next) => {
  let goal = await Goal.findById(req.params.id);
  if (!goal) {
    return next(new ErrorResponse(`Goal not found with id ${req.params.id}`, 404));
  }
  if (goal.userId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this goal', 401));
  }

  // If categoryId is being changed, validate ownership
  if (req.body.categoryId && req.body.categoryId !== goal.categoryId?.toString()) {
    const cat = await Category.findById(req.body.categoryId);
    if (!cat) return next(new ErrorResponse('Category not found', 404));
    if (cat.userId.toString() !== req.user.id)
      return next(new ErrorResponse('Not authorized to use this category', 401));
  }

    // Never let the update payload change ownership of the resource, even
  // for the owner's own request — userId is set once at creation only.
  delete req.body.userId;

  goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: goal });
});

// @desc    Delete goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
exports.deleteGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    return next(new ErrorResponse(`Goal not found with id ${req.params.id}`, 404));
  }
  if (goal.userId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this goal', 401));
  }

  await goal.remove();
  res.status(200).json({ success: true, data: {} });
});