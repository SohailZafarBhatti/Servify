const express = require('express');
const {
  getDashboardStats,
  getUsers,
  getTasks,
  getIssues,
  getCategories
} = require('../controllers/adminController');

const router = express.Router();

console.log('Simple admin routes loaded successfully');

// Simple test route
router.get('/test', (req, res) => {
  console.log('Admin test route hit');
  res.json({
    success: true,
    message: 'Admin routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Health check route
router.get('/health', (req, res) => {
  console.log('Admin health check route hit');
  res.json({
    success: true,
    message: 'Admin API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple dashboard stats route
router.get('/dashboard-stats', (req, res, next) => {
  console.log('Dashboard stats route hit');
  next();
}, getDashboardStats);

// Simple users route
router.get('/users', (req, res, next) => {
  console.log('Admin users route hit');
  next();
}, getUsers);

// Simple tasks route
router.get('/tasks', (req, res, next) => {
  console.log('Admin tasks route hit');
  next();
}, getTasks);

// Simple issues route
router.get('/issues', (req, res, next) => {
  console.log('Admin issues route hit');
  next();
}, getIssues);

// Simple categories route
router.get('/categories', (req, res, next) => {
  console.log('Admin categories route hit');
  next();
}, getCategories);

module.exports = router;