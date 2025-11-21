// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// HOC
import withAuthProtection from './hoc/withAuthProtection';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import CreateTask from './pages/CreateTask';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import MyTasks from './pages/MyTasks';
import Earnings from './pages/Earnings';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedComponent from './examples/ProtectedComponent';

// Public Pages
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQs from './pages/FAQs';
import HelpCenter from './pages/HelpCenter';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Components
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';

// ✅ Wrap protected pages once
const ProtectedDashboard = withAuthProtection(Dashboard);
const ProtectedTaskList = withAuthProtection(TaskList);
const ProtectedTaskDetail = withAuthProtection(TaskDetail);
const ProtectedCreateTask = withAuthProtection(CreateTask);
const ProtectedProfile = withAuthProtection(Profile);
const ProtectedChat = withAuthProtection(Chat);
const ProtectedMyTasks = withAuthProtection(MyTasks);
const ProtectedEarnings = withAuthProtection(Earnings);
const ProtectedExample = withAuthProtection(ProtectedComponent);
const ProtectedAdmin = withAuthProtection(AdminDashboard);


const AppContent = () => {
  const location = useLocation();
  const { loading: authLoading } = useAuth();

  // Pages where Navbar should be hidden
  const hideNavbarPages = ['/login', '/register'];
  const isAdminPage = location.pathname.startsWith('/admin');
  const shouldHideNavbar = isAdminPage || hideNavbarPages.includes(location.pathname);

  // Full-page loader while checking auth
  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        <p className="text-lg mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {!shouldHideNavbar && <Navbar />}
      <main className={!shouldHideNavbar ? "pt-16" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected Routes (all via HOC) */}
          <Route path="/dashboard" element={<ProtectedDashboard />} />
          <Route path="/tasks" element={<ProtectedTaskList />} />
          <Route path="/tasks/:id" element={<ProtectedTaskDetail />} />
          <Route path="/create-task" element={<ProtectedCreateTask />} />
          <Route path="/profile" element={<ProtectedProfile />} />
          <Route path="/chat" element={<ProtectedChat />} />
          <Route path="/chat/:taskId" element={<ProtectedChat />} />
          <Route path="/my-tasks" element={<ProtectedMyTasks />} />
          <Route path="/earnings" element={<ProtectedEarnings />} />
          <Route path="/protected-example" element={<ProtectedExample />} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          

          {/* 404 Page */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-6">Oops! Page not found.</p>
              <a 
                href="/" 
                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              >
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <AuthProvider>
          <SocketProvider>
            <AppContent />
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
