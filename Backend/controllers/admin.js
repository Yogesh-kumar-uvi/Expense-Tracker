const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Bill = require('../models/Bill');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get system-wide stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  const [userCount, transactionCount, budgetCount, goalCount, billCount] =
    await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Budget.countDocuments(),
      Goal.countDocuments(),
      Bill.countDocuments(),
    ]);

  res.status(200).json({
    success: true,
    data: {
      userCount,
      transactionCount,
      budgetCount,
      goalCount,
      billCount,
    },
  });
});
