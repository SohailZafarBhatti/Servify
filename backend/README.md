# SERVIFY Backend API

A comprehensive backend API for the SERVIFY platform - a service provider marketplace connecting users with skilled service providers.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Registration, profile management, and verification for service providers
- **Task Management**: Create, update, and manage service tasks with geolocation support
- **Real-time Communication**: Socket.IO integration for instant messaging
- **Review & Rating System**: Comprehensive feedback system for service quality
- **Issue Reporting**: Dispute resolution and problem reporting system
- **Admin Panel**: Complete administrative interface for platform management
- **File Upload**: Support for profile pictures and task images
- **Geolocation Services**: Location-based task matching and proximity search

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Validation**: Express-validator
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management (to be implemented)
│   ├── taskController.js    # Task management (to be implemented)
│   ├── chatController.js    # Chat functionality (to be implemented)
│   └── adminController.js   # Admin panel (to be implemented)
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── errorHandler.js     # Error handling middleware
├── models/
│   ├── User.js             # User model
│   ├── Task.js             # Task model
│   ├── Chat.js             # Chat model
│   ├── Review.js           # Review model
│   └── Issue.js            # Issue model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User routes
│   ├── tasks.js            # Task routes
│   ├── chat.js             # Chat routes
│   └── admin.js            # Admin routes
├── uploads/                # File upload directory
├── utils/                  # Utility functions
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd servify/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/servify

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Email Configuration (for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads

   # Google Maps API (for geolocation)
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key

   # Socket.IO Configuration
   SOCKET_CORS_ORIGIN=http://localhost:5173
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/service-providers` - Get service providers
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `POST /api/users/upload-picture` - Upload profile picture
- `PUT /api/users/verify/:id` - Verify service provider (Admin only)

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/nearby` - Get nearby tasks
- `GET /api/tasks/my-tasks` - Get user's tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/accept` - Accept task (Service Provider only)
- `PUT /api/tasks/:id/status` - Update task status
- `POST /api/tasks/:id/cancel` - Cancel task

### Chat
- `GET /api/chat` - Get user's chats
- `GET /api/chat/:taskId` - Get chat for specific task
- `POST /api/chat/:taskId/message` - Send message
- `PUT /api/chat/:chatId/read` - Mark messages as read
- `GET /api/chat/unread/count` - Get unread message count

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/tasks` - Get all tasks
- `GET /api/admin/issues` - Get all issues
- `GET /api/admin/reviews` - Get all reviews

## Models

### User Model
- Basic info: name, email, password, phone
- Role-based: user, service_provider, admin
- Service provider specific: serviceCategory, cnic, policeVerification
- Profile: address, profilePicture, rating, totalReviews
- Status: isVerified, isActive

### Task Model
- Basic info: title, description, category, priority
- Location: address and coordinates for geolocation
- Budget: min and max budget range
- Scheduling: preferredDate, preferredTime
- Status: posted, accepted, in_progress, completed, cancelled, reviewed
- Progress tracking: startDate, completionDate, estimatedDuration

### Chat Model
- Participants: array of user IDs
- Task reference: linked to specific task
- Messages: array of message objects with sender, content, timestamp
- Status: isActive, lastMessage

### Review Model
- Task and user references
- Rating: overall rating and category-specific ratings
- Comment: detailed feedback
- Status: isVerified, isReported

### Issue Model
- Reporter and reported user references
- Task reference
- Issue details: type, title, description, evidence
- Status: pending, under_review, resolved, dismissed
- Admin handling: assignedTo, adminNotes, resolution

## Socket.IO Events

### Client to Server
- `join` - Join user room
- `send_message` - Send chat message
- `task_update` - Update task status
- `send_notification` - Send notification

### Server to Client
- `receive_message` - Receive chat message
- `task_updated` - Task status updated
- `receive_notification` - Receive notification

## Error Handling

The API uses a centralized error handling system with:
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages in development
- Mongoose validation error handling
- JWT token error handling
- File upload error handling

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation with express-validator
- CORS configuration
- File upload security
- Rate limiting (to be implemented)

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

## Deployment

1. Set environment variables for production
2. Install production dependencies
3. Build the application
4. Start the server with PM2 or similar process manager

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.
