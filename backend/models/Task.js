const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    minBudget: { type: Number, required: true },
    maxBudget: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["posted", "accepted", "in_progress", "completed", "cancelled"], default: "posted" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: { type: String }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
