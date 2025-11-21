const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getMyTasks,
  createTask,
  getAllTasks,
  getAssignedTasks,
  updateTaskStatus,
  deleteTask,
  getTaskById,
  acceptTask,
} = require("../controllers/taskController");

// Order matters - more specific routes first
router.get("/my-tasks", protect, getMyTasks);
router.get("/assigned", protect, getAssignedTasks);
router.put("/:id/accept", protect, acceptTask); // FIXED: Added protect middleware
router.get("/:id", protect, getTaskById);
router.put("/:id/status", protect, updateTaskStatus);
router.post("/", protect, createTask);
router.delete("/:id", protect, deleteTask);

// General routes last
router.get("/", protect, getAllTasks);

module.exports = router;