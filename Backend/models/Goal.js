const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a goal name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please add a target amount'],
      min: [0, 'Target amount must be >= 0'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    deadline: {
      type: Date,
      // optional, but if set must be in the future
    },
    // optional: link to a category (e.g., savings category)
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  { timestamps: true }
);

// Indexes for typical look‑ups
goalSchema.index({ userId: 1 });
goalSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('Goal', goalSchema);