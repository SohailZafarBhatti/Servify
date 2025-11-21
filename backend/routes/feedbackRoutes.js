const express = require('express');
const {
  submitFeedback,
  getFeedbackByTask,
  getFeedbackByProvider,
  getCustomerFeedback,
  getPendingFeedback
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

// Validation middleware for feedback submission
const validateFeedback = [
  body('taskId')
    .isMongoId()
    .withMessage('Valid task ID is required'),
  body('serviceProviderId')
    .isMongoId()
    .withMessage('Valid service provider ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot exceed 500 characters'),
  validateRequest
];

// @route   POST /api/feedback
// @desc    Submit feedback for a completed task
// @access  Private (Customer)
router.post('/', protect, validateFeedback, submitFeedback);

// @route   GET /api/feedback/pending
// @desc    Get tasks pending feedback for current customer
// @access  Private (Customer)
router.get('/pending', protect, getPendingFeedback);

// @route   GET /api/feedback/customer
// @desc    Get customer's submitted feedback
// @access  Private (Customer)
router.get('/customer', protect, getCustomerFeedback);

// @route   GET /api/feedback/task/:taskId
// @desc    Get feedback for a specific task
// @access  Private
router.get('/task/:taskId', protect, getFeedbackByTask);

// @route   GET /api/feedback/provider/:providerId
// @desc    Get all feedback for a service provider
// @access  Private
router.get('/provider/:providerId', protect, getFeedbackByProvider);

module.exports = router;