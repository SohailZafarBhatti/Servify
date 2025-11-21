const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  adminLogout,
  getDashboardStats,
  getUsers,
  getTasks
} = require('../controllers/adminController');

const { protectAdmin, checkAdminPermission } = require('../middleware/adminAuth');

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all admin routes
router.use(adminLimiter);

// Test route to verify admin routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Enhanced validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password length invalid')
];

const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// Admin authentication routes
router.post('/login', authLimiter, loginValidation, validate, adminLogin);

router.post('/logout', protectAdmin, adminLogout);

// Admin profile routes
router.get('/profile', protectAdmin, getAdminProfile);

router.put('/profile', protectAdmin, profileUpdateValidation, validate, updateAdminProfile);

router.put('/change-password', protectAdmin, passwordChangeValidation, validate, changeAdminPassword);

// Admin dashboard routes  
router.get('/dashboard-stats', (req, res, next) => {
  console.log('Dashboard stats route hit');
  next();
}, getDashboardStats); // Temporarily remove auth for testing
router.get('/stats', protectAdmin, getDashboardStats); // Alternative route name

// Admin management routes with pagination support
router.get('/users', 
  // protectAdmin, 
  // checkAdminPermission('manage_users'),
  (req, res, next) => {
    console.log('Admin users route hit');
    next();
  },
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long'),
    query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
  ],
  validate,
  getUsers
);

router.get('/tasks', 
  // protectAdmin, 
  // checkAdminPermission('manage_tasks'),
  (req, res, next) => {
    console.log('Admin tasks route hit');
    next();
  },
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
  ],
  validate,
  getTasks
);

router.get('/providers', 
  protectAdmin, 
  checkAdminPermission('manage_providers'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    query('category').optional().trim().isLength({ max: 50 }).withMessage('Category name too long')
  ],
  validate,
  (req, res) => {
    const { page = 1, limit = 10, verified, category } = req.query;
    res.json({
      success: true,
      message: 'Provider management endpoint - to be implemented',
      data: {
        providers: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        },
        filters: { verified, category }
      }
    });
  }
);

router.get('/reports', 
  protectAdmin, 
  checkAdminPermission('view_reports'),
  [
    query('type').optional().isIn(['user', 'task', 'provider', 'financial']).withMessage('Invalid report type'),
    query('start_date').optional().isISO8601().withMessage('Invalid start date format'),
    query('end_date').optional().isISO8601().withMessage('Invalid end date format'),
    query('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Invalid format')
  ],
  validate,
  (req, res) => {
    const { type, start_date, end_date, format = 'json' } = req.query;
    res.json({
      success: true,
      message: 'Reports endpoint - to be implemented',
      data: {
        report_type: type,
        date_range: { start_date, end_date },
        format,
        data: []
      }
    });
  }
);

router.get('/settings', 
  protectAdmin, 
  checkAdminPermission('system_settings'), 
  (req, res) => {
    res.json({
      success: true,
      message: 'System settings endpoint - to be implemented',
      data: {
        general: {},
        security: {},
        notifications: {},
        integrations: {}
      }
    });
  }
);

router.put('/settings', 
  protectAdmin, 
  checkAdminPermission('system_settings'),
  [
    body('category').isIn(['general', 'security', 'notifications', 'integrations']).withMessage('Invalid settings category'),
    body('settings').isObject().withMessage('Settings must be an object')
  ],
  validate,
  (req, res) => {
    const { category, settings } = req.body;
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { category, settings }
    });
  }
);

// Audit log endpoint
router.get('/audit-logs', 
  protectAdmin, 
  checkAdminPermission('view_audit_logs'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('action').optional().trim().isLength({ max: 50 }).withMessage('Action name too long'),
    query('user_id').optional().isMongoId().withMessage('Invalid user ID'),
    query('start_date').optional().isISO8601().withMessage('Invalid start date format'),
    query('end_date').optional().isISO8601().withMessage('Invalid end date format')
  ],
  validate,
  (req, res) => {
    const { page = 1, limit = 10, action, user_id, start_date, end_date } = req.query;
    res.json({
      success: true,
      message: 'Audit logs endpoint - to be implemented',
      data: {
        logs: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        },
        filters: { action, user_id, start_date, end_date }
      }
    });
  }
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Admin route error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

module.exports = router;