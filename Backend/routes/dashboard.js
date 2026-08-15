const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboard');

// @desc    Get dashboard stats
// @route   GET /api/v1/dashboard
// @access  Private
router.route('/').get(protect, getDashboard);

module.exports = router;