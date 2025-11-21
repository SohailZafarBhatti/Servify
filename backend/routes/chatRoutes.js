const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getChats, getMessages, sendMessage, getTaskChat } = require("../controllers/chatController");

// Debug logging for chat routes
console.log('[CHAT ROUTES] Chat routes module loaded');

// Add middleware to log all requests to chat routes
router.use((req, res, next) => {
  console.log(`\n=== CHAT ROUTE HIT ===`);
  console.log(`Method: ${req.method}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Base URL: ${req.baseUrl}`);
  console.log(`Path: ${req.path}`);
  console.log(`Params:`, req.params);
  console.log(`Body:`, req.body);
  console.log(`User:`, req.user ? `ID: ${req.user._id}` : 'Not authenticated');
  console.log('=====================\n');
  next();
});

// Test route to verify routing is working
router.get("/test", (req, res) => {
  console.log('[CHAT] Test route hit!');
  res.json({ 
    success: true, 
    message: "Chat routes are working!",
    timestamp: new Date().toISOString()
  });
});

// Your existing routes with additional logging
router.get("/", (req, res, next) => {
  console.log('[CHAT] GET / - getChats');
  next();
}, protect, getChats);

router.get("/task/:taskId", (req, res, next) => {
  console.log('[CHAT] GET /task/:taskId - getTaskChat', req.params);
  next();
}, protect, getTaskChat);

router.get("/:taskId/messages", (req, res, next) => {
  console.log('[CHAT] GET /:taskId/messages - getMessages', req.params);
  next();
}, protect, getMessages);

router.post("/:taskId/messages", (req, res, next) => {
  console.log('[CHAT] POST /:taskId/messages - sendMessage', req.params, req.body);
  next();
}, protect, sendMessage);

// Add support for singular /message endpoint (for compatibility)
router.post("/:taskId/message", (req, res, next) => {
  console.log('[CHAT] POST /:taskId/message - sendMessage (singular)', req.params, req.body);
  next();
}, protect, sendMessage);

// Catch-all for unmatched chat routes
router.use('*', (req, res) => {
  console.log(`[CHAT 404] Unmatched chat route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: `Chat route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /api/chat/',
      'GET /api/chat/test',
      'GET /api/chat/task/:taskId', 
      'GET /api/chat/:taskId/messages',
      'POST /api/chat/:taskId/messages'
    ]
  });
});

console.log('[CHAT ROUTES] All routes registered');

module.exports = router;