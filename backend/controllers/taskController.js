const Task = require("../models/Task");
const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");
const geocodeLocation = require("../utils/geocode");
const sendEmail = require("../utils/sendEmail"); // helper to send emails
const sendSMS = require("../utils/sendSMS"); // helper to send SMS

// @desc    Get all my tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ createdBy: req.user._id }).populate("assignedTo", "name email");
  res.json({ tasks });
});

// @desc    Get all available tasks (public list for service providers)
// @route   GET /api/tasks
// @access  Private (service providers)
const getAllTasks = asyncHandler(async (req, res) => {
  console.log('=== GET ALL TASKS DEBUG ===');
  console.log('User ID:', req.user._id);
  console.log('User type:', req.user.userType);

  // FIXED: Return all tasks that are either:
  // 1. Posted (available for acceptance)
  // 2. Assigned to the current user (accepted, in_progress, completed by this user)
  const tasks = await Task.find({
    $or: [
      { status: "posted" }, // Available tasks
      { assignedTo: req.user._id } // Tasks assigned to this user
    ]
  })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  console.log('Found tasks:', tasks.length);
  console.log('Task details:', tasks.map(t => ({ 
    id: t._id, 
    status: t.status, 
    title: t.title, 
    assignedTo: t.assignedTo?._id,
    createdBy: t.createdBy._id
  })));

  res.json({ tasks });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  // Debug: Log the incoming payload
  console.log('=== CREATE TASK DEBUG ===');
  console.log('Request body:', req.body);
  console.log('User ID:', req.user._id);
  
  // Accept multiple payload shapes from different frontends
  const {
    title,
    description,
    budgetMin,
    budgetMax,
    budget, // optional: { min, max }
    date,
    location: locationInput, // can be string, GeoJSON, or { address, coordinates }
    category,
    priority,
  } = req.body;

  // Normalize budgets - handle both budgetMin/budgetMax and budget.min/max formats
  let minBudgetNum, maxBudgetNum;
  
  if (budget && typeof budget === 'object' && budget.min !== undefined && budget.max !== undefined) {
    // Format: { budget: { min: X, max: Y } }
    minBudgetNum = Number(budget.min);
    maxBudgetNum = Number(budget.max);
  } else if (budgetMin !== undefined && budgetMax !== undefined) {
    // Format: { budgetMin: X, budgetMax: Y }
    minBudgetNum = Number(budgetMin);
    maxBudgetNum = Number(budgetMax);
  } else {
    console.log('Budget validation failed - budgetMin:', budgetMin, 'budgetMax:', budgetMax, 'budget:', budget);
    return res.status(400).json({ message: "Budget range (min and max) is required" });
  }

  // Basic validation with detailed logging
  console.log('Validation check:', {
    title: title?.trim(),
    description: description?.trim(),
    minBudgetNum,
    maxBudgetNum,
    date,
    category: category?.trim()
  });

  if (!title?.trim() || !description?.trim() || !minBudgetNum || !maxBudgetNum || !date || !category?.trim()) {
    return res.status(400).json({ 
      message: "Missing required fields", 
      details: {
        title: !title?.trim() ? "missing" : "ok",
        description: !description?.trim() ? "missing" : "ok", 
        budget: (!minBudgetNum || !maxBudgetNum) ? "missing" : "ok",
        date: !date ? "missing" : "ok",
        category: !category?.trim() ? "missing" : "ok"
      }
    });
  }

  // Resolve location into GeoJSON if provided
  let resolvedLocation = undefined;
  if (locationInput) {
    // Case 1: string address
    if (typeof locationInput === "string") {
      const coords = await geocodeLocation(locationInput);
      if (!coords) return res.status(400).json({ message: "Invalid address" });
      resolvedLocation = { type: "Point", coordinates: coords, address: locationInput };
    } else if (typeof locationInput === "object") {
      // Case 2: already GeoJSON { type: 'Point', coordinates: [lng, lat], address? }
      if (locationInput.type === "Point" && Array.isArray(locationInput.coordinates)) {
        resolvedLocation = {
          type: "Point",
          coordinates: locationInput.coordinates,
          address: locationInput.address,
        };
      } else if (locationInput.coordinates && typeof locationInput.coordinates === "object") {
        // Case 3: coordinates as { lat, lng }
        const lat = locationInput.coordinates.lat ?? locationInput.lat;
        const lng = locationInput.coordinates.lng ?? locationInput.lng;
        if (typeof lat === "number" && typeof lng === "number") {
          resolvedLocation = {
            type: "Point",
            coordinates: [lng, lat],
            address: locationInput.address,
          };
        }
      } else if (locationInput.address && typeof locationInput.address === "string") {
        // Case 4: { address } only → geocode
        const coords = await geocodeLocation(locationInput.address);
        if (!coords) return res.status(400).json({ message: "Invalid address" });
        resolvedLocation = { type: "Point", coordinates: coords, address: locationInput.address };
      }
    }
  }

  const task = new Task({
    title,
    description,
    minBudget: minBudgetNum,
    maxBudget: maxBudgetNum,
    date,
    category,
    priority: priority || "medium",
    createdBy: req.user._id,
    location: resolvedLocation,
  });

  console.log('Task object to save:', task);
  
  await task.save();
  console.log('Task saved successfully with ID:', task._id);

  if (req.io) req.io.to(req.user._id.toString()).emit("newTask", task);

  res.status(201).json({ task });
});

// @desc    Get tasks assigned to me
// @route   GET /api/tasks/assigned
// @access  Private
const getAssignedTasks = asyncHandler(async (req, res) => {
  console.log('=== GET ASSIGNED TASKS DEBUG ===');
  console.log('User ID:', req.user._id);
  console.log('User type:', req.user.userType);
  
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });
  
  console.log('Found assigned tasks:', tasks.length);
  console.log('Task details:', tasks.map(t => ({ 
    id: t._id, 
    status: t.status, 
    title: t.title, 
    assignedTo: t.assignedTo?._id 
  })));
  
  res.json({ tasks });
});

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");
  
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  
  res.json({ task });
});

// @desc    Accept a task (DEDICATED ENDPOINT)
// @route   PUT /api/tasks/:id/accept
// @access  Private
const acceptTask = asyncHandler(async (req, res) => {
  console.log('=== ACCEPT TASK DEBUG ===');
  console.log('Task ID:', req.params.id);
  console.log('User ID:', req.user._id);
  
  const task = await Task.findById(req.params.id).populate("createdBy", "name email");
  
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  
  if (task.createdBy._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You cannot accept your own task" });
  }
  
  if (task.status !== 'posted' || task.assignedTo) {
    return res.status(400).json({ message: "Task is not available for acceptance" });
  }

  task.assignedTo = req.user._id;
  task.status = 'accepted';

  await task.save();
  
  // Populate the saved task
  await task.populate("assignedTo", "name email");
  
  console.log('Task accepted successfully:', {
    id: task._id,
    status: task.status,
    assignedTo: task.assignedTo._id,
    title: task.title
  });

  // Create notification
  try {
    const notification = await Notification.create({
      user: task.createdBy._id,
      message: `Your task "${task.title}" was accepted by ${req.user.name || "a service provider"}.`,
    });

    // Real-time Socket.IO
    if (req.io) {
      req.io.to(task.createdBy._id.toString()).emit("receive_notification", notification);
      req.io.to(task.createdBy._id.toString()).emit("task_updated", task);
      req.io.to(req.user._id.toString()).emit("task_updated", task);
    }

    // Email notification
    await sendEmail({ 
      to: task.createdBy.email, 
      subject: "Task Accepted", 
      text: notification.message 
    });

    // SMS notification if phone available
    if (task.createdBy.phone) {
      await sendSMS({ 
        to: task.createdBy.phone, 
        message: notification.message 
      });
    }
  } catch (notificationError) {
    console.log('Notification failed:', notificationError);
    // Don't fail the request if notification fails
  }

  res.json({ task, message: "Task accepted successfully" });
});

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  console.log('=== UPDATE TASK STATUS DEBUG ===');
  console.log('Task ID:', req.params.id);
  console.log('New status:', status);
  console.log('User ID:', req.user._id);
  console.log('User type:', req.user.userType);
  
  const task = await Task.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");
    
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  console.log('Current task:', {
    id: task._id,
    status: task.status,
    createdBy: task.createdBy._id,
    assignedTo: task.assignedTo?._id,
    title: task.title
  });

  if (status === 'accepted') {
    if (task.createdBy._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot accept your own task" });
    }
    if (task.status !== 'posted' || task.assignedTo) {
      return res.status(400).json({ message: "Task is not available for acceptance" });
    }

    task.assignedTo = req.user._id;
    task.status = 'accepted';

    // Save notification in DB
    try {
      const notification = await Notification.create({
        user: task.createdBy._id,
        message: `Your task "${task.title}" was accepted by ${req.user.name || "a service provider"}.`,
      });

      // Real-time Socket.IO
      if (req.io) req.io.to(task.createdBy._id.toString()).emit("receive_notification", notification);

      // Email, SMS, Push
      await sendEmail({ to: task.createdBy.email, subject: "Task Accepted", text: notification.message });
      if (task.createdBy.phone) await sendSMS({ to: task.createdBy.phone, message: notification.message });
    } catch (notificationError) {
      console.log('Notification failed:', notificationError);
    }
  }
  else if (status === 'in_progress') {
    // Only assigned service provider can start
    if (!task.assignedTo || !task.assignedTo._id.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the assigned service provider can start this task" });
    }
    task.status = 'in_progress';
  } else if (status === 'completed') {
    // Only assigned service provider can complete
    if (!task.assignedTo || !task.assignedTo._id.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the assigned service provider can complete this task" });
    }
    task.status = 'completed';
  } else if (status === 'cancelled') {
    // Allow poster to cancel; optionally allow provider to cancel with reason
    if (!task.createdBy._id.equals(req.user._id) && (!task.assignedTo || !task.assignedTo._id.equals(req.user._id))) {
      return res.status(403).json({ message: "Not authorized to cancel this task" });
    }
    task.status = 'cancelled';
  } else {
    return res.status(400).json({ message: "Invalid status update" });
  }

  await task.save();
  console.log('Task saved successfully with new status:', task.status);
  
  // Populate the saved task before returning
  await task.populate("createdBy", "name email");
  await task.populate("assignedTo", "name email");
  
  // Verify the saved task
  console.log('Verified saved task:', {
    id: task._id,
    status: task.status,
    assignedTo: task.assignedTo?._id,
    title: task.title
  });

  // Emit real-time update
  if (req.io) {
    // Emit to task poster
    req.io.to(task.createdBy._id.toString()).emit("task_updated", task);
    // Emit to assigned service provider if any
    if (task.assignedTo) {
      req.io.to(task.assignedTo._id.toString()).emit("task_updated", task);
    }
  }

  res.json({ task });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (!task.createdBy.equals(req.user._id)) return res.status(401).json({ message: "Not authorized" });

  await task.remove();
  res.json({ message: "Task deleted" });
});

module.exports = {
  getMyTasks,
  createTask,
  getAllTasks,
  getAssignedTasks,
  getTaskById,
  acceptTask, // Export the dedicated accept function
  updateTaskStatus,
  deleteTask,
};