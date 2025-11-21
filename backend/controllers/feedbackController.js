const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');
const Task = require('../models/Task');

// @desc    Submit feedback for a completed task
// @route   POST /api/feedback
// @access  Private (Customer only)
const submitFeedback = asyncHandler(async (req, res) => {
  const { taskId, serviceProviderId, rating, feedback, completionDate } = req.body;

  // Validation
  if (!taskId || !serviceProviderId || !rating) {
    res.status(400);
    throw new Error('Task ID, Service Provider ID, and rating are required');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Verify task exists and is completed
  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.status !== 'completed') {
    res.status(400);
    throw new Error('Can only provide feedback for completed tasks');
  }

  // Verify user is the task creator (customer)
  if (task.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the task creator can provide feedback');
  }

  // Verify service provider is assigned to the task
  if (task.assignedTo.toString() !== serviceProviderId) {
    res.status(400);
    throw new Error('Service provider mismatch');
  }

  // Check if feedback already exists
  const existingFeedback = await Feedback.findOne({ task: taskId });
  if (existingFeedback) {
    res.status(400);
    throw new Error('Feedback has already been submitted for this task');
  }

  try {
    // Create feedback
    const newFeedback = new Feedback({
      task: taskId,
      customer: req.user._id,
      serviceProvider: serviceProviderId,
      rating: parseInt(rating),
      feedback: feedback ? feedback.trim() : '',
      completionDate: completionDate || new Date()
    });

    await newFeedback.save();

    // Populate the feedback for response
    await newFeedback.populate([
      { path: 'task', select: 'title' },
      { path: 'customer', select: 'name email' },
      { path: 'serviceProvider', select: 'name email' }
    ]);

    console.log('Feedback submitted successfully:', {
      feedbackId: newFeedback._id,
      taskId: taskId,
      rating: rating,
      customerId: req.user._id,
      serviceProviderId: serviceProviderId
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: newFeedback
    });

  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500);
    throw new Error('Failed to submit feedback');
  }
});

// @desc    Get feedback for a specific task
// @route   GET /api/feedback/task/:taskId
// @access  Private
const getFeedbackByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const feedback = await Feedback.findOne({ task: taskId })
    .populate('customer', 'name email')
    .populate('serviceProvider', 'name email')
    .populate('task', 'title status');

  if (!feedback) {
    res.status(404);
    throw new Error('No feedback found for this task');
  }

  res.status(200).json({
    success: true,
    feedback: feedback
  });
});

// @desc    Get all feedback for a service provider
// @route   GET /api/feedback/provider/:providerId
// @access  Private
const getFeedbackByProvider = asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get feedback with pagination
  const feedback = await Feedback.find({ serviceProvider: providerId })
    .populate('customer', 'name')
    .populate('task', 'title completedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const totalFeedback = await Feedback.countDocuments({ serviceProvider: providerId });

  // Calculate provider statistics
  const stats = await Feedback.calculateProviderAverage(providerId);

  res.status(200).json({
    success: true,
    feedback: feedback,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFeedback / parseInt(limit)),
      totalFeedback: totalFeedback,
      hasMore: skip + feedback.length < totalFeedback
    },
    stats: stats
  });
});

// @desc    Get customer's submitted feedback
// @route   GET /api/feedback/customer
// @access  Private (Customer)
const getCustomerFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const feedback = await Feedback.find({ customer: req.user._id })
    .populate('serviceProvider', 'name')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalFeedback = await Feedback.countDocuments({ customer: req.user._id });

  res.status(200).json({
    success: true,
    feedback: feedback,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFeedback / parseInt(limit)),
      totalFeedback: totalFeedback,
      hasMore: skip + feedback.length < totalFeedback
    }
  });
});

// @desc    Get tasks pending feedback for customer
// @route   GET /api/feedback/pending
// @access  Private (Customer)
const getPendingFeedback = asyncHandler(async (req, res) => {
  // Find completed tasks created by user that don't have feedback yet
  const completedTasks = await Task.find({
    createdBy: req.user._id,
    status: 'completed'
  }).populate('assignedTo', 'name email');

  // Get task IDs that already have feedback
  const feedbackTaskIds = await Feedback.find({
    customer: req.user._id
  }).distinct('task');

  // Filter out tasks that already have feedback
  const pendingTasks = completedTasks.filter(task => 
    !feedbackTaskIds.some(feedbackTaskId => 
      feedbackTaskId.toString() === task._id.toString()
    )
  );

  res.status(200).json({
    success: true,
    pendingTasks: pendingTasks,
    count: pendingTasks.length
  });
});

module.exports = {
  submitFeedback,
  getFeedbackByTask,
  getFeedbackByProvider,
  getCustomerFeedback,
  getPendingFeedback
};