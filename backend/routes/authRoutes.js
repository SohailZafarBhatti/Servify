const express = require("express");
const router = express.Router();
const {protect}  = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

router.post("/register", upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'policeVerification', maxCount: 1 }
]), registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
