const jwt = require('jsonwebtoken');
const { Admin } = require('../models/Admin');

// Protect admin routes
const protectAdmin = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const secret = process.env.JWT_SECRET || 'servify_jwt_secret_key_2024_very_secure_and_long_key_for_production';
    const decoded = jwt.verify(token, secret);

    // Check if token is for admin
    if (decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access admin routes'
      });
    }

    // Get admin from token
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('protectAdmin error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check admin permissions
const checkAdminPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${permission} required`
      });
    }

    next();
  };
};

// Super admin only
const superAdminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  next();
};

module.exports = {
  protectAdmin,
  checkAdminPermission,
  superAdminOnly
};
