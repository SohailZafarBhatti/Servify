const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
const validateEmail = require("../utils/validateEmail");
const validatePakistaniPhone = require("../utils/validatePhone");

// Generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Capitalize first letter of name
const capitalizeName = (name) => {
  if (!name) return name;
  return name.trim().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Validate password: minimum 6 characters, at least one alphabet and one number
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

// @desc    Register new user
// @route   POST /api/auth/register

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, role, cnic } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  // Capitalize name
  const capitalizedName = capitalizeName(name);

  // Validate email format and existence
  const emailValidation = await validateEmail(email.trim().toLowerCase());
  if (!emailValidation.valid) {
    return res.status(400).json({ message: emailValidation.message });
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  // Validate Pakistani phone number
  const phoneValidation = validatePakistaniPhone(phone);
  if (!phoneValidation.valid) {
    return res.status(400).json({ message: phoneValidation.message });
  }

  // Check if user already exists
  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Handle file uploads
  const avatar = req.files?.avatar ? `/uploads/${req.files.avatar[0].filename}` : undefined;
  const policeVerification = req.files?.policeVerification ? `/uploads/${req.files.policeVerification[0].filename}` : undefined;
  
  // Map role to userType and handle service provider data
  const userType = role || "user";
  const userData = {
    name: capitalizedName,
    email: email.trim().toLowerCase(),
    password,
    phone: phoneValidation.cleaned, // Use cleaned phone number
    address,
    avatar,
    userType
  };

  // Add service provider specific fields
  if (userType === "service_provider") {
    if (cnic) userData.cnic = cnic;
    if (policeVerification) userData.policeVerification = policeVerification;
  }

  const user = await User.create(userData);
  const token = generateToken(user._id);

  // Send welcome email
  try {
    console.log(`Attempting to send welcome email to: ${user.email}`);
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SERVIFY!</h1>
          </div>
          <div class="content">
            <div class="message">
              <h2>Registration Successful!</h2>
              <p>Dear ${capitalizedName},</p>
              <p>You are registered successfully on SERVIFY. Thanks for joining us.</p>
              <p>Best regards,<br>The SERVIFY Team</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SERVIFY. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Welcome to SERVIFY - Registration Successful!',
      html: emailHtml
    });
    
    console.log(`Welcome email sent successfully to: ${user.email}`);
  } catch (emailError) {
    // Log error but don't fail registration if email fails
    console.error('Failed to send welcome email:', emailError.message);
    console.error('Email error details:', emailError);
    // Continue with registration even if email fails
  }

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({ 
    success: true,
    user: userResponse, 
    token 
  });
});

// @desc    Login user
// @route   POST /api/auth/login

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res.json({ user, token });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Update profile
// @route   PUT /api/auth/profile

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { name, phone, address, serviceDescription, experience, cnic, serviceCategory } = req.body;
  if (name) user.name = capitalizeName(name);
  if (phone) {
    const phoneValidation = validatePakistaniPhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ message: phoneValidation.message });
    }
    user.phone = phoneValidation.cleaned;
  }
  if (address) user.address = address;
  if (serviceDescription !== undefined) user.serviceDescription = serviceDescription;
  if (experience !== undefined) user.experience = experience;
  if (cnic) user.cnic = cnic;
  if (serviceCategory) user.serviceCategory = serviceCategory;
  if (req.file) user.avatar = `/uploads/${req.file.filename}`;

  await user.save();
  res.json(user);
});

// @desc    Change password
// @route   PUT /api/auth/change-password

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user || !(await user.matchPassword(oldPassword)))
    return res.status(400).json({ message: "Old password is incorrect" });

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
};
