const { Admin } = require('../models/Admin');
const User = require('../models/User');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

//Admin login
// POST /api/admin/login

exports.adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    try {
        const admin = await Admin.findOne({ email }).select('+password');
        
        if (!admin) {
            res.status(401);
            throw new Error('Invalid credentials');
        }

        const isMatch = await admin.comparePassword(password);
        
        if (!isMatch) {
            res.status(401);
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            res.status(500);
            throw new Error('Server configuration error: JWT_SECRET not set');
        }
        const token = jwt.sign(
            { id: admin._id, type: 'admin', role: admin.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        console.log(`Admin logged in: ${admin.email}`);

        res.json({
            success: true,
            data: {
                ...admin.getPublicProfile(),
                token
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(error.statusCode || 500);
        throw new Error(error.message || 'Server error during login');
    }
});

// Get admin profile
// GET /api/admin/profile

exports.getAdminProfile = asyncHandler(async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id || req.admin._id).select('-password');
        
        if (!admin) {
            res.status(404);
            throw new Error('Admin profile not found');
        }

        res.json({
            success: true,
            data: admin.getPublicProfile()
        });

    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(error.statusCode || 500);
        throw new Error(error.message || 'Failed to get admin profile');
    }
});

//   Update admin profile
//  PUT /api/admin/profile

exports.updateAdminProfile = asyncHandler(async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        const admin = await Admin.findById(req.admin._id);
        
        if (!admin) {
            res.status(404);
            throw new Error('Admin not found');
        }

        // Check if email is being changed and if it already exists
        if (email && email !== admin.email) {
            const existingAdmin = await Admin.findOne({ email, _id: { $ne: admin._id } });
            if (existingAdmin) {
                res.status(400);
                throw new Error('Email already in use');
            }
        }

        // Update fields
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;

        await admin.save();

        console.log(`Admin profile updated: ${admin.email}`);

        res.json({
            success: true,
            data: admin.getPublicProfile(),
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update admin profile error:', error);
        res.status(error.statusCode || 500);
        throw new Error(error.message || 'Failed to update admin profile');
    }
});

// Change admin password
//    PUT /api/admin/change-password

exports.changeAdminPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current password and new password');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters long');
    }

    try {
        const admin = await Admin.findById(req.admin._id).select('+password');
        
        if (!admin) {
            res.status(404);
            throw new Error('Admin not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            res.status(400);
            throw new Error('Current password is incorrect');
        }

        // Hash and set new password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        
        await admin.save();

        console.log(`Admin password changed: ${admin.email}`);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change admin password error:', error);
        res.status(error.statusCode || 500);
        throw new Error(error.message || 'Failed to change password');
    }
});

//    Admin logout
//  POST /api/admin/logout

exports.adminLogout = asyncHandler(async (req, res) => {
    try {
        // In a JWT-based system, logout is typically handled client-side
        // by removing the token. However, we can log the logout event.
        
        if (req.admin) {
            console.log(`Admin logged out: ${req.admin.email}`);
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500);
        throw new Error('Server error during logout');
    }
});

//   Get dashboard statistics
//    GET /api/admin/dashboard-stats

exports.getDashboardStats = asyncHandler(async (req, res) => {
    try {
        console.log('getDashboardStats function called');
        console.log('Fetching dashboard stats...');

        // Get basic counts
        const [
            totalUsers,
            totalTasks,
            totalIssues,
            activeUsers,
            completedTasks,
            pendingTasks,
            totalRevenue
        ] = await Promise.all([
            User.countDocuments(),
            Task.countDocuments(),
            Issue ? Issue.countDocuments() : 0,
            User.countDocuments({ 
                lastLogin: { 
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            }),
            Task.countDocuments({ status: 'completed' }),
            Task.countDocuments({ status: { $in: ['posted', 'accepted', 'in_progress'] } }),
            Task.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$maxBudget' } } }
            ]).then(result => result[0]?.total || 0)
        ]);

        // Get recent activities
        const recentTasks = await Task.find()
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title status createdBy assignedTo createdAt');

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt userType');

        // Get tasks by status
        const tasksByStatus = await Task.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get users by type
        const usersByType = await User.aggregate([
            { $group: { _id: '$userType', count: { $sum: 1 } } }
        ]);

        // Monthly task creation trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTasks = await Task.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        console.log(`Dashboard stats compiled: ${totalUsers} users, ${totalTasks} tasks`);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalTasks,
                    totalIssues,
                    activeUsers,
                    completedTasks,
                    pendingTasks,
                    totalRevenue
                },
                charts: {
                    tasksByStatus: tasksByStatus.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {}),
                    usersByType: usersByType.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {}),
                    monthlyTasks: monthlyTasks.map(item => ({
                        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                        count: item.count
                    }))
                },
                recentActivity: {
                    tasks: recentTasks,
                    users: recentUsers
                }
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500);
        throw new Error('Failed to get dashboard statistics');
    }
});

//    Get all users (for admin management)
//    GET /api/admin/users

exports.getUsers = asyncHandler(async (req, res) => {
    try {
        console.log('getUsers function called');
        const { page = 1, limit = 10, search, userType, status } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (userType) {
            query.userType = userType;
        }

        if (status) {
            query.isActive = status === 'active';
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500);
        throw new Error('Failed to get users');
    }
});

//     Get all tasks (for admin management)
//   GET /api/admin/tasks

exports.getTasks = asyncHandler(async (req, res) => {
    try {
        console.log('getTasks function called');
        const { page = 1, limit = 10, search, status, category } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status) {
            query.status = status;
        }

        if (category) {
            query.category = category;
        }

        const tasks = await Task.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Task.countDocuments(query);

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500);
        throw new Error('Failed to get tasks');
    }
});

//    Get all categories (for admin management)
//   GET /api/admin/categories

exports.getCategories = asyncHandler(async (req, res) => {
    try {
        console.log('getCategories function called');
        
        // Get unique categories from tasks
        const categories = await Task.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Format the categories data
        const formattedCategories = categories.map(cat => ({
            name: cat._id,
            taskCount: cat.count,
            isActive: true // All categories from tasks are considered active
        }));

        console.log(`Found ${formattedCategories.length} categories`);

        res.json({
            success: true,
            data: {
                categories: formattedCategories,
                pagination: {
                    page: 1,
                    pages: 1,
                    total: formattedCategories.length
                }
            }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500);
        throw new Error('Failed to get categories');
    }
});

//     Get all issues (for admin management)
//    GET /api/admin/issues

exports.getIssues = asyncHandler(async (req, res) => {
    try {
        console.log('getIssues function called');
        const { page = 1, limit = 10, search, status, issueType } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status) {
            query.status = status;
        }

        if (issueType) {
            query.issueType = issueType;
        }

        const issues = await Issue.find(query)
            .populate('reporter', 'name email')
            .populate('reportedUser', 'name email')
            .populate('task', 'title')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Issue.countDocuments(query);

        res.json({
            success: true,
            data: {
                issues,
                pagination: {
                    page: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get issues error:', error);
        res.status(500);
        throw new Error('Failed to get issues');
    }
});