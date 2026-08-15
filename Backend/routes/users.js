const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
router.route('/').get(protect, (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
router.route('/:id').get(protect, (req, res) => {
  res.status(200).json({ success: true, data: {} });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
router.route('/').post(protect, (req, res) => {
  res.status(201).json({ success: true, data: {} });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
router.route('/:id').put(protect, (req, res) => {
  res.status(200).json({ success: true, data: {} });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
router.route('/:id').delete(protect, (req, res) => {
  res.status(200).json({ success: true, data: {} });
});

module.exports = router;