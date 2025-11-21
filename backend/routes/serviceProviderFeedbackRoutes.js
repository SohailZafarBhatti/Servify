const express = require('express');
const {
  submitFeedbackAndCompleteTask,
  getMyFeedback,
  getCustomerFeedback,
  getTaskFeedback
} = require('../controllers/serviceProviderFeedbackController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

// Validation middleware for feedback submission
const validateFeedbackSubmission = [
  body('taskId')
    .isMongoId()
    .withMessage('Valid task ID is required'),
  body('customerId')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5'),
  body('workSatisfaction')
    .isInt({ min: 1, max: 5 })
    .withMessage('Work satisfaction rating must be between 1 and 5'),
  body('communication')
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('payment')
    .isInt({ min: 1, max: 5 })
    .withMessage('Payment rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot exceed 500 characters'),
  validateRequest
];

// @route   POST /api/service-provider-feedback
// @desc    Submit feedback and complete task
// @access  Private (Service Provider)
router.post('/', protect, validateFeedbackSubmission, submitFeedbackAndCompleteTask);

// @route   GET /api/service-provider-feedback/my-feedback
// @desc    Get feedback given by current service provider
// @access  Private (Service Provider)
router.get('/my-feedback', protect, getMyFeedback);

// @route   GET /api/service-provider-feedback/customer/:customerId
// @desc    Get feedback received by a customer
// @access  Private
router.get('/customer/:customerId', protect, getCustomerFeedback);

// @route   GET /api/service-provider-feedback/task/:taskId
// @desc    Get feedback for a specific task
// @access  Private
router.get('/task/:taskId', protect, getTaskFeedback);

module.exports = router;