const express = require('express');
const {
  reportIssue,
  getMyReports,
  getIssuesAgainstMe,
  getIssueById
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

// Validation middleware for issue reporting
const validateIssueReport = [
  body('taskId')
    .isMongoId()
    .withMessage('Valid task ID is required'),
  body('type')
    .isIn(['payment_dispute', 'client_behavior', 'safety_concern', 'other'])
    .withMessage('Invalid issue type'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Valid user ID required if provided'),
  validateRequest
];

// @route   POST /api/issues
// @desc    Report an issue
// @access  Private
router.post('/', protect, validateIssueReport, reportIssue);

// @route   GET /api/issues/my-reports
// @desc    Get user's reported issues
// @access  Private
router.get('/my-reports', protect, getMyReports);

// @route   GET /api/issues/against-me
// @desc    Get issues reported against user
// @access  Private
router.get('/against-me', protect, getIssuesAgainstMe);

// @route   GET /api/issues/:id
// @desc    Get issue by ID
// @access  Private
router.get('/:id', protect, getIssueById);

module.exports = router;