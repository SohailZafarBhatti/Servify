const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth"); // normal user auth
const { getMe, updateMe } = require("../controllers/userController");

// Fetch current logged-in user info
router.get("/me", protect, getMe);

// Update profile (with optional avatar upload)
router.put("/me", protect, (req, res, next) => {
  console.log('PUT /api/users/me route hit');
  console.log('User ID:', req.user?._id);
  next();
}, upload.single("avatar"), (req, res, next) => {
  console.log('After upload middleware');
  console.log('File processed:', !!req.file);
  console.log('Body after upload:', req.body);
  next();
}, updateMe);

module.exports = router;
