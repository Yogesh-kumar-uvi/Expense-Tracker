const asyncHandler = require('../middleware/asyncHandler');
const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ userId: req.user.id });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the category
  if (category.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to access this category`, 401));
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user.id;

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the category
  if (category.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this category`, 401));
  }
  // Never let the update payload change ownership of the resource, even
  // for the owner's own request — userId is set once at creation only.
  delete req.body.userId;
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the category
  if (category.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this category`, 401));
  }

  await category.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});