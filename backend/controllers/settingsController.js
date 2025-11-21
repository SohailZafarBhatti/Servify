const User = require("../models/User");

// ✅ Get user settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// ✅ Update user settings + real-time update
const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    Object.assign(user.settings, req.body);
    await user.save();

    // Emit real-time event to this user
    req.io.to(req.user._id.toString()).emit("settingsUpdated", user.settings);

    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};

// ✅ Correct export
module.exports = { getSettings, updateSettings };
