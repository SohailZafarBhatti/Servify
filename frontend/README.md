# SERVIFY Frontend

A modern React-based frontend for the SERVIFY platform - a service provider marketplace connecting users with skilled service providers.

## Features

- **Modern UI/UX**: Built with Material-UI for a beautiful and responsive design
- **Authentication System**: Complete login/register functionality with JWT tokens
- **Role-based Access**: Different interfaces for users, service providers, and admins
- **Real-time Communication**: Socket.IO integration for instant messaging
- **Form Validation**: Comprehensive form validation using React Hook Form and Yup
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Protected Routes**: Authentication-based route protection
- **Context Management**: Global state management with React Context

## Tech Stack

- **Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router DOM v6
- **Form Handling**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Styling**: Emotion (CSS-in-JS)

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx     # Navigation component
│   │   ├── ProtectedRoute.jsx  # Route protection
│   │   └── AdminRoute.jsx # Admin route protection
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx    # Authentication context
│   │   └── SocketContext.jsx  # Socket.IO context
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Landing page
│   │   ├── Login.jsx      # Login page
│   │   ├── Register.jsx   # Registration page
│   │   ├── Dashboard.jsx  # User dashboard
│   │   ├── TaskList.jsx   # Task listing
│   │   ├── TaskDetail.jsx # Task details
│   │   ├── CreateTask.jsx # Create task form
│   │   ├── Profile.jsx    # User profile
│   │   ├── Chat.jsx       # Chat interface
│   │   └── AdminDashboard.jsx # Admin panel
│   ├── services/          # API service functions
│   │   └── authService.js # Authentication API calls
│   ├── utils/             # Utility functions
│   ├── assets/            # Images, icons, etc.
│   ├── App.jsx            # Main app component
│   └── main.jsx           # App entry point
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd servify/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Pages and Features

### Public Pages
- **Home** (`/`) - Landing page with platform overview
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration with role selection

### Protected Pages
- **Dashboard** (`/dashboard`) - User dashboard with quick actions
- **Tasks** (`/tasks`) - Browse and manage tasks
- **Task Detail** (`/tasks/:id`) - View specific task details
- **Create Task** (`/create-task`) - Post new service requests (Users only)
- **Profile** (`/profile`) - User profile management
- **Chat** (`/chat`) - Real-time messaging interface

### Admin Pages
- **Admin Dashboard** (`/admin`) - Administrative panel (Admin only)

## Components

### Core Components
- **Navbar** - Main navigation with user menu
- **ProtectedRoute** - Authentication-based route protection
- **AdminRoute** - Admin-only route protection

### Context Providers
- **AuthContext** - Manages user authentication state
- **SocketContext** - Handles real-time communication

## Authentication Flow

1. **Registration**: Users can register as either regular users or service providers
2. **Login**: JWT-based authentication with token storage
3. **Route Protection**: Automatic redirection for unauthenticated users
4. **Token Management**: Automatic token refresh and logout on expiration

## Real-time Features

- **Socket.IO Integration**: Real-time messaging and notifications
- **Chat System**: Instant messaging between users and service providers
- **Task Updates**: Real-time task status updates
- **Notifications**: Live notification system

## Form Validation

- **React Hook Form**: Efficient form handling
- **Yup Schema Validation**: Comprehensive validation rules
- **Error Handling**: User-friendly error messages
- **Field Validation**: Real-time validation feedback

## Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Breakpoint System**: Responsive layouts for all screen sizes
- **Touch-Friendly**: Optimized for touch interactions
- **Accessibility**: WCAG compliant design

## API Integration

- **Axios Configuration**: Centralized API client setup
- **Token Management**: Automatic token inclusion in requests
- **Error Handling**: Consistent error handling across the app
- **Loading States**: User feedback during API calls

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for better type safety (future enhancement)
- Implement proper error boundaries

### Component Structure
- Keep components small and focused
- Use proper prop validation
- Implement proper loading and error states
- Follow Material-UI design patterns

### State Management
- Use React Context for global state
- Use local state for component-specific data
- Implement proper state updates
- Handle async operations correctly

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set the following environment variables for production:
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.IO server URL

### Deployment Platforms
- **Vercel**: Recommended for React apps
- **Netlify**: Alternative deployment option
- **AWS S3**: Static hosting option

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Future Enhancements

- **TypeScript Migration**: Add type safety
- **PWA Features**: Offline support and app-like experience
- **Advanced Chat**: File sharing and voice messages
- **Payment Integration**: Stripe/PayPal integration
- **Push Notifications**: Browser push notifications
- **Advanced Search**: Elasticsearch integration
- **Analytics**: User behavior tracking
- **Internationalization**: Multi-language support

## Support

For support and questions, please contact the development team.

## License

This project is licensed under the MIT License.
