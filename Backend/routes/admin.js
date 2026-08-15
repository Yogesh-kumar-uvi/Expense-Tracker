const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getStats } = require('../controllers/admin');

// @desc    Get all users (admin only)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
router.route('/users').get(protect, authorize('admin'), getUsers);

// @desc    Get system stats (admin only)
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
router.route('/stats').get(protect, authorize('admin'), getStats);

module.exports = router;
