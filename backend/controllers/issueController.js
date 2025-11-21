const Issue = require('../models/Issue');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Report an issue
// @route   POST /api/issues
// @access  Private
const reportIssue = async (req, res) => {
  try {
    const { taskId, userId, type, description, title } = req.body;
    
    // Validate required fields
    if (!taskId || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Task ID, type, and description are required'
      });
    }

    // Validate task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Validate reported user if provided
    let reportedUser = null;
    if (userId) {
      reportedUser = await User.findById(userId);
      if (!reportedUser) {
        return res.status(404).json({
          success: false,
          message: 'Reported user not found'
        });
      }
    }

    // Map frontend type names to backend enum values
    const typeMapping = {
      'payment_dispute': 'payment_issue',
      'client_behavior': 'inappropriate_behavior',
      'safety_concern': 'safety_concern',
      'other': 'other'
    };

    const mappedType = typeMapping[type] || 'other';

    // Create the issue
    const issue = new Issue({
      reporter: req.user.id,
      reportedUser: userId || task.createdBy,
      task: taskId,
      issueType: mappedType,
      title: title || `${type.replace('_', ' ')} - ${task.title}`,
      description,
      status: 'pending',
      priority: 'medium'
    });

    await issue.save();

    // Populate the created issue
    const populatedIssue = await Issue.findById(issue._id)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('task', 'title');

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: populatedIssue
    });

  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's reported issues
// @route   GET /api/issues/my-reports
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const issues = await Issue.find({ reporter: req.user.id })
      .populate('reportedUser', 'name email')
      .populate('task', 'title')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: issues
    });

  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get issues reported against user
// @route   GET /api/issues/against-me
// @access  Private
const getIssuesAgainstMe = async (req, res) => {
  try {
    const issues = await Issue.find({ reportedUser: req.user.id })
      .populate('reporter', 'name email')
      .populate('task', 'title')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: issues
    });

  } catch (error) {
    console.error('Error fetching issues against user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get issue by ID
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('task', 'title description')
      .populate('assignedTo', 'name')
      .populate('adminNotes.admin', 'name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user has permission to view this issue
    if (issue.reporter._id.toString() !== req.user.id && 
        issue.reportedUser._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: issue
    });

  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  reportIssue,
  getMyReports,
  getIssuesAgainstMe,
  getIssueById
};