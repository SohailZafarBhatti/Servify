import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
  <nav className="bg-primary-800 fixed w-full z-50 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo + Text */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img
            src="/logo.png"   // 👈 public folder me logo rakho
            alt="Servify Logo"
            className="h-10 w-auto"
          />
          <span className="ml-2 text-white font-bold text-xl tracking-wide">
            SERVIFY
          </span>
        </div>

          {/* Links */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-300 px-3 py-2 text-sm font-medium">
                  {user?.name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
