const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Attach io to each request BEFORE routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const chatRoutes = require("./routes/chatRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutesSimple"); // ✅ temporary simple version for testing
const settingsRoutes = require("./routes/settingsRoutes");
const issueRoutes = require("./routes/issueRoutes");
const serviceProviderFeedbackRoutes = require("./routes/serviceProviderFeedbackRoutes");


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
// Add logging middleware for admin routes
app.use("/api/admin", (req, res, next) => {
  console.log(`[ADMIN] ${req.method} ${req.originalUrl}`);
  console.log(`[ADMIN] Headers:`, req.headers);
  console.log(`[ADMIN] Query:`, req.query);
  next();
});

app.use("/api/admin", adminRoutes); // ✅ mounted admin routes
app.use("/api/settings", settingsRoutes); // ✅ mounted
app.use("/api/issues", issueRoutes);
app.use("/api/service-provider-feedback", serviceProviderFeedbackRoutes);

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", message: "Servify API running" })
);

// Socket.IO events
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (userId) => {
    console.log(`[Backend] User ${userId} joining room`);
    console.log(`[Backend] Socket ID: ${socket.id}`);
    socket.join(userId);
    console.log(`[Backend] User ${userId} successfully joined room`);
  });

  socket.on("send_message", (data) => {
    console.log("Socket message received:", data);

    socket.to(data.receiverId).emit("receive_message", {
      chatId: data.chatId,
      taskId: data.taskId,
      message: data.message,
    });

    socket.emit("message_sent", { success: true });
  });

  socket.on("task_update", (data) => {
    console.log("Task update received:", data);
    socket.to(data.userId).emit("task_updated", data);
  });

  socket.on("send_notification", (data) => {
    console.log("Notification received:", data);
    socket.to(data.userId).emit("receive_notification", data);
  });

  socket.on("join_chat", (chatId) => {
    console.log(`User joining chat room: ${chatId}`);
    socket.join(chatId);
  });

  socket.on("leave_chat", (chatId) => {
    console.log(`User leaving chat room: ${chatId}`);
    socket.leave(chatId);
  });

  socket.on("disconnect", () =>
    console.log("Client disconnected:", socket.id)
  );
});

// Error handling
const { errorHandler } = require("./middleware/errorHandler");
app.use(errorHandler);

// DB connection
const { createDefaultAdmin } = require('./models/Admin');

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/servify")
  .then(() => {
    console.log("MongoDB connected");
    // Create default admin after DB connection
    createDefaultAdmin();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
