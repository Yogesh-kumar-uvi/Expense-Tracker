const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
} = require('../controllers/notifications');

router.route('/').get(protect, getNotifications).post(protect, createNotification);
router.route('/:id')
  .get(protect, getNotification)
  .put(protect, updateNotification)
  .delete(protect, deleteNotification);

module.exports = router;