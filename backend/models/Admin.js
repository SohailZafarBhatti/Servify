const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(password) {
        // Strong password validation: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    validate: {
      validator: function(name) {
        return /^[a-zA-Z\s]+$/.test(name);
      },
      message: 'Name can only contain letters and spaces'
    }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(phone) {
        return !phone || validator.isMobilePhone(phone);
      },
      message: 'Please provide a valid phone number'
    }
  },
  avatar: {
    type: String,
    validate: {
      validator: function(url) {
        return !url || validator.isURL(url);
      },
      message: 'Please provide a valid URL for avatar'
    }
  },
  role: {
    type: String,
    default: 'admin',
    enum: {
      values: ['admin', 'super_admin', 'moderator'],
      message: 'Role must be either admin, super_admin, or moderator'
    },
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: {
    type: Date,
    index: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  permissions: [{
    type: String,
    enum: {
      values: [
        'manage_users', 
        'manage_tasks', 
        'manage_providers', 
        'view_reports', 
        'system_settings',
        'view_audit_logs',
        'manage_admins',
        'financial_reports'
      ],
      message: 'Invalid permission'
    }
  }],
  twoFactorSecret: {
    type: String,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  passwordChangedAt: Date,
  sessionTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    userAgent: String,
    ipAddress: String
  }],
  auditLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
adminSchema.index({ email: 1, isActive: 1 });
adminSchema.index({ role: 1, isActive: 1 });
adminSchema.index({ lastLogin: -1 });
adminSchema.index({ 'sessionTokens.token': 1 });
adminSchema.index({ 'sessionTokens.expiresAt': 1 });

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full name display
adminSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Remove expired session tokens before saving
adminSchema.pre('save', function(next) {
  if (this.isModified('sessionTokens')) {
    this.sessionTokens = this.sessionTokens.filter(
      session => session.expiresAt > new Date()
    );
  }
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    throw new Error('Password not available for comparison');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Handle failed login attempts
adminSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
adminSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Get public profile (without sensitive data)
adminSchema.methods.getPublicProfile = function() {
  const adminObject = this.toObject();
  
  // Remove sensitive fields
  delete adminObject.password;
  delete adminObject.twoFactorSecret;
  delete adminObject.passwordResetToken;
  delete adminObject.passwordResetExpires;
  delete adminObject.sessionTokens;
  delete adminObject.emailVerificationToken;
  delete adminObject.auditLog;
  
  return adminObject;
};

// Create password reset token
adminSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Create email verification token
adminSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Check if password was changed after JWT was issued
adminSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  
  // False means password not changed
  return false;
};

// Add session token
adminSchema.methods.addSessionToken = function(token, userAgent, ipAddress) {
  this.sessionTokens.push({
    token,
    userAgent,
    ipAddress
  });
  
  // Keep only last 5 sessions
  if (this.sessionTokens.length > 5) {
    this.sessionTokens = this.sessionTokens.slice(-5);
  }
};

// Remove session token
adminSchema.methods.removeSessionToken = function(token) {
  this.sessionTokens = this.sessionTokens.filter(
    session => session.token !== token
  );
};

// Add audit log entry
adminSchema.methods.addAuditLog = function(action, ipAddress, userAgent, details = {}) {
  this.auditLog.push({
    action,
    ipAddress,
    userAgent,
    details
  });
  
  // Keep only last 100 audit entries per admin
  if (this.auditLog.length > 100) {
    this.auditLog = this.auditLog.slice(-100);
  }
};

// Check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Static method to find by email (case insensitive)
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    email: email.toLowerCase(),
    isActive: true 
  }).select('+password');
};

// Static method to cleanup expired tokens
adminSchema.statics.cleanupExpiredTokens = async function() {
  const now = new Date();
  return this.updateMany(
    {},
    {
      $pull: {
        sessionTokens: { expiresAt: { $lt: now } }
      },
      $unset: {
        emailVerificationToken: "",
        emailVerificationExpires: "",
        passwordResetToken: "",
        passwordResetExpires: ""
      }
    },
    {
      multi: true,
      conditions: {
        $or: [
          { 'sessionTokens.expiresAt': { $lt: now } },
          { emailVerificationExpires: { $lt: now } },
          { passwordResetExpires: { $lt: now } }
        ]
      }
    }
  );
};

const Admin = mongoose.model('Admin', adminSchema);

// Create default admin if it doesn't exist
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: 'waleedmeer36@gmail.com' });
    
    if (!existingAdmin) {
      const defaultAdmin = new Admin({
        email: 'waleedmeer36@gmail.com',
        password: 'Admin123!@#',
        name: 'Super Admin',
        role: 'super_admin',
        isEmailVerified: true,
        permissions: [
          'manage_users', 
          'manage_tasks', 
          'manage_providers', 
          'view_reports', 
          'system_settings',
          'view_audit_logs',
          'manage_admins',
          'financial_reports'
        ]
      });
      
      await defaultAdmin.save();
      console.log('Default admin created successfully');
      console.log('Email: waleedmeer36@gmail.com');
      console.log('Password: Admin123!@#');
      console.log('⚠️  Please change the default password immediately!');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Cleanup expired tokens every hour
setInterval(async () => {
  try {
    await Admin.cleanupExpiredTokens();
    console.log('Cleaned up expired tokens');
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
  }
}, 60 * 60 * 1000); // 1 hour

module.exports = { Admin, createDefaultAdmin };