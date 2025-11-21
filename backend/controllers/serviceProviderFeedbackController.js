const asyncHandler = require('express-async-handler');
const ServiceProviderFeedback = require('../models/ServiceProviderFeedback');
const Task = require('../models/Task');

// @desc    Submit feedback when completing a task (Service Provider -> Customer)
// @route   POST /api/service-provider-feedback
// @access  Private (Service Provider only)
const submitFeedbackAndCompleteTask = asyncHandler(async (req, res) => {
  const { taskId, customerId, rating, workSatisfaction, communication, payment, feedback } = req.body;

  // Validation
  if (!taskId || !customerId || !rating || !workSatisfaction || !communication || !payment) {
    res.status(400);
    throw new Error('Task ID, Customer ID, and all ratings are required');
  }

  // Validate rating values
  const ratings = [rating, workSatisfaction, communication, payment];
  const invalidRating = ratings.some(r => r < 1 || r > 5);
  if (invalidRating) {
    res.status(400);
    throw new Error('All ratings must be between 1 and 5');
  }

  // Verify task exists and is in progress
  const task = await Task.findById(taskId).populate('createdBy assignedTo');
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.status !== 'in_progress') {
    res.status(400);
    throw new Error('Can only complete tasks that are in progress');
  }

  // Verify user is the assigned service provider
  if (task.assignedTo._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the assigned service provider can complete this task');
  }

  // Verify customer ID matches task creator
  if (task.createdBy._id.toString() !== customerId) {
    res.status(400);
    throw new Error('Customer ID does not match task creator');
  }

  // Check if feedback already exists
  const existingFeedback = await ServiceProviderFeedback.findOne({ 
    task: taskId, 
    serviceProvider: req.user._id 
  });
  if (existingFeedback) {
    res.status(400);
    throw new Error('Feedback has already been submitted for this task');
  }

  try {
    // Create feedback
    const newFeedback = await ServiceProviderFeedback.create({
      task: taskId,
      serviceProvider: req.user._id,
      customer: customerId,
      rating,
      workSatisfaction,
      communication,
      payment,
      feedback: feedback || '',
      completionDate: new Date()
    });

    // Update task status to completed
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    // Populate the feedback for response
    const populatedFeedback = await ServiceProviderFeedback.findById(newFeedback._id)
      .populate('task', 'title')
      .populate('customer', 'name email')
      .populate('serviceProvider', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task completed and feedback submitted successfully',
      data: {
        feedback: populatedFeedback,
        task: {
          _id: task._id,
          title: task.title,
          status: task.status,
          completedAt: task.completedAt
        }
      }
    });

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.to(customerId).emit('task_completed', {
        taskId: task._id,
        status: 'completed',
        completedBy: req.user._id,
        completedAt: task.completedAt
      });
    }

  } catch (error) {
    console.error('Error creating feedback and completing task:', error);
    res.status(500);
    throw new Error('Failed to complete task and submit feedback');
  }
});

// @desc    Get feedback given by a service provider
// @route   GET /api/service-provider-feedback/my-feedback
// @access  Private (Service Provider)
const getMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await ServiceProviderFeedback.find({ serviceProvider: req.user._id })
    .populate('task', 'title')
    .populate('customer', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: feedback
  });
});

// @desc    Get feedback received by a customer from service providers
// @route   GET /api/service-provider-feedback/customer/:customerId
// @access  Private
const getCustomerFeedback = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  // Only allow users to view their own feedback or admin access
  if (req.user._id.toString() !== customerId && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  const feedback = await ServiceProviderFeedback.find({ customer: customerId })
    .populate('task', 'title')
    .populate('serviceProvider', 'name email avatar')
    .sort({ createdAt: -1 });

  const stats = await ServiceProviderFeedback.calculateCustomerAverage(customerId);

  res.json({
    success: true,
    data: {
      feedback,
      stats
    }
  });
});

// @desc    Get feedback for a specific task
// @route   GET /api/service-provider-feedback/task/:taskId
// @access  Private
const getTaskFeedback = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const feedback = await ServiceProviderFeedback.findOne({ task: taskId })
    .populate('task', 'title')
    .populate('customer', 'name email')
    .populate('serviceProvider', 'name email avatar');

  if (!feedback) {
    res.status(404);
    throw new Error('No feedback found for this task');
  }

  // Verify user has access to this feedback
  const task = await Task.findById(taskId);
  if (task.createdBy.toString() !== req.user._id.toString() && 
      task.assignedTo?.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({
    success: true,
    data: feedback
  });
});

module.exports = {
  submitFeedbackAndCompleteTask,
  getMyFeedback,
  getCustomerFeedback,
  getTaskFeedback
};