// In your middleware/auth.js file, update the protect function like this:

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  console.log('\n=== AUTH MIDDLEWARE ===');
  
  let token;
  
  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('[AUTH] Token found in header');
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH] Token verified, user ID:', decoded.id);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('[AUTH] User not found in database');
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      
      console.log('[AUTH] User authenticated:', req.user.name, req.user.email);
      console.log('========================\n');
      
      next();
    } catch (error) {
      console.error('[AUTH] Token verification failed:', error.message);
      console.log('========================\n');
      
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } else {
    console.log('[AUTH] No token provided in Authorization header');
    console.log('[AUTH] Headers:', req.headers);
    console.log('========================\n');
    
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

module.exports = { protect };