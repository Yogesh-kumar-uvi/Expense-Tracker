const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Bill = require('../models/Bill');
const ErrorResponse = require('../utils/errorResponse');

// Helper: sum amounts for a user, optionally filtered by type, date range, and category.
// NOTE: Model.aggregate() does NOT auto-cast query values the way find() does —
// so a plain string userId/categoryId here would silently match zero documents
// even when matching transactions exist. Both must be cast to ObjectId explicitly.
const sumTransactions = async (userId, { start, end, type, categoryId } = {}) => {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  if (type) {
    // Case‑insensitive match for transaction type (income/expense)
    match.type = { $regex: new RegExp(`^${type}$`, 'i') };
  }
  if (categoryId) match.categoryId = new mongoose.Types.ObjectId(categoryId);
  if (start || end) {
    match.date = {};
    if (start) match.date.$gte = new Date(start);
    if (end) match.date.$lte = new Date(end);
  }
  const agg = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return agg.length > 0 ? agg[0].total : 0;
};

// @desc    Get dashboard summary for the logged in user
// @route   GET /api/v1/dashboard
// @access  Private
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Income & expense for ALL time (to show user's recent transactions)
  const incomeCurrent = await sumTransactions(userId, {
    type: 'income',
  });
  const expenseCurrent = await sumTransactions(userId, {
    type: 'expense',
  });

  // Budgets with spent/remaining (still month‑to‑date)
  const budgets = await Budget.find({ userId }).populate('categoryId', 'name type');
  const budgetsWithStats = await Promise.all(
    budgets.map(async (b) => {
      const spent = await sumTransactions(userId, {
        start: b.startDate,
        end: b.endDate,
        type: 'expense',
        categoryId: b.categoryId?._id,
      });
      return {
        ...b.toObject(),
        spent,
        remaining: Math.max(b.amount - spent, 0),
        percentSpent: b.amount ? ((spent / b.amount) * 100).toFixed(2) : 0,
      };
    })
  );

  // Goals progress
  const goals = await Goal.find({ userId });
  const goalsWithProgress = goals.map((g) => ({
    ...g.toObject(),
    progressPercent: g.targetAmount ? ((g.currentAmount / g.targetAmount) * 100).toFixed(2) : 0,
  }));

  // Upcoming bills (due in the next 7 days, including today) - using UTC for consistent date comparison
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfSevenDaysLater = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7, 23, 59, 59, 999));
  const upcomingBills = await Bill.find({
    userId,
    dueDate: { $gte: startOfToday, $lte: endOfSevenDaysLater },
    paid: false,
  }).sort({ dueDate: 1 });

  // Pending bills (due after the next 7 days)
  const pendingBills = await Bill.find({
    userId,
    dueDate: { $gt: endOfSevenDaysLater },
    paid: false,
  }).sort({ dueDate: 1 });

  // Overdue bills (due before today)
  const overdueBills = await Bill.find({
    userId,
    dueDate: { $lt: startOfToday },
    paid: false,
  }).sort({ dueDate: 1 });

  res.status(200).json({
    success: true,
    data: {
      incomeCurrent,
      expenseCurrent,
      netCurrent: incomeCurrent - expenseCurrent,
      budgets: budgetsWithStats,
      goals: goalsWithProgress,
      upcomingBills,
      pendingBills,
      overdueBills,
    },
  });
});