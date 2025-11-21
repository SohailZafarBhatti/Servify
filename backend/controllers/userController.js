const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

// helper: prepend BASE_URL
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "";
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  return `${baseUrl}${avatarPath}`;
};

// GET /api/users/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      avatar: getAvatarUrl(user.avatar),
      role: user.role,
      cnic: user.cnic || "",
      serviceCategory: user.serviceCategory || "",
      serviceDescription: user.serviceDescription || "",
      experience: user.experience || "",
    },
  });
});

// PUT /api/users/me
exports.updateMe = async (req, res) => {
  try {
    console.log('updateMe called for user:', req.user._id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { name, phone, address, password, cnic, serviceCategory, serviceDescription, experience } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (cnic !== undefined) user.cnic = cnic;
    if (serviceCategory !== undefined) user.serviceCategory = serviceCategory;
    if (serviceDescription !== undefined) user.serviceDescription = serviceDescription;
    if (experience !== undefined) user.experience = experience;

    if (password && password.trim()) {
      console.log('Updating password for user');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // ✅ Save avatar if uploaded
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    let updatedUser;
    try {
      // Only validate modified paths, not all required fields
      updatedUser = await user.save({ validateModifiedOnly: true });
      console.log('User updated successfully:', updatedUser._id);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      console.error('Modified paths:', user.modifiedPaths());
      console.error('Validation errors:', saveError.errors);
      throw saveError;
    }

    const responseData = {
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        avatar: getAvatarUrl(updatedUser.avatar),
        role: updatedUser.role,
        cnic: updatedUser.cnic || "",
        serviceCategory: updatedUser.serviceCategory || "",
        serviceDescription: updatedUser.serviceDescription || "",
        experience: updatedUser.experience || "",
      },
    };
    
    console.log('Sending response:', responseData);
    res.json(responseData);
    
  } catch (error) {
    console.error('Error in updateMe:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // More specific error information
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('MongoDB error code:', error.code);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred',
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};
