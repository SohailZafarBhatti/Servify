const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  issueType: {
    type: String,
    enum: ['dispute', 'inappropriate_behavior', 'poor_service', 'payment_issue', 'safety_concern', 'other'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  evidence: [{
    type: String, // URLs to uploaded files/images
    description: String
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Admin handling
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin user
  },
  adminNotes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    action: {
      type: String,
      enum: ['warning', 'suspension', 'ban', 'no_action', 'other']
    },
    details: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
issueSchema.index({ reporter: 1 });
issueSchema.index({ reportedUser: 1 });
issueSchema.index({ task: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ createdAt: -1 });

// Method to add admin note
issueSchema.methods.addAdminNote = function(adminId, note) {
  this.adminNotes.push({
    admin: adminId,
    note,
    createdAt: new Date()
  });
  
  this.updatedAt = new Date();
  return this.save();
};

// Method to update status
issueSchema.methods.updateStatus = function(newStatus, adminId = null) {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  if (newStatus === 'resolved' && adminId) {
    this.resolution.resolvedBy = adminId;
    this.resolution.resolvedAt = new Date();
  }
  
  return this.save();
};

// Method to assign to admin
issueSchema.methods.assignToAdmin = function(adminId) {
  this.assignedTo = adminId;
  this.status = 'under_review';
  this.updatedAt = new Date();
  return this.save();
};

// Static method to get issue statistics
issueSchema.statics.getIssueStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const priorityStats = await this.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  const typeStats = await this.aggregate([
    {
      $group: {
        _id: '$issueType',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    statusStats: stats,
    priorityStats,
    typeStats
  };
};

module.exports = mongoose.model('Issue', issueSchema);
