const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc Get all notifications for the logged in user
// @route GET /api/v1/notifications
// @access Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc Get single notification
// @route GET /api/v1/notifications/:id
// @access Private
exports.getNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id ${req.params.id}`, 404));
  }
  if (notification.userId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this notification', 401));
  }
  res.status(200).json({ success: true, data: notification });
});

// @desc Create new notification
// @route POST /api/v1/notifications
// @access Private
exports.createNotification = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user.id;
  const notification = await Notification.create(req.body);
  res.status(201).json({ success: true, data: notification });
});

// @desc Update notification (e.g., mark as read)
// @route PUT /api/v1/notifications/:id
// @access Private
exports.updateNotification = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);
  if (!notification)
    return next(new ErrorResponse(`Notification not found with id ${req.params.id}`, 404));
  if (notification.userId.toString() !== req.user.id)
    return next(new ErrorResponse('Not authorized to update this notification', 401));

  notification = await Notification.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: notification });
});

// @desc Delete notification
// @route DELETE /api/v1/notifications/:id
// @access Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification)
    return next(new ErrorResponse(`Notification not found with id ${req.params.id}`, 404));
  if (notification.userId.toString() !== req.user.id)
    return next(new ErrorResponse('Not authorized to delete this notification', 401));

  await notification.remove();
  res.status(200).json({ success: true, data: {} });
});