const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");

// Get notifications
const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Mark one as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  notification.read = true;
  await notification.save();
  res.json(notification);
});

// Mark all as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json({ message: "All notifications marked as read" });
});

module.exports = { getAllNotifications, markAsRead, markAllAsRead };
