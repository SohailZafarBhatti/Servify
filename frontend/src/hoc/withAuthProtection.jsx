import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import withLoading from './withLoading';

/**
 * Higher-Order Component (HOC) that combines authentication protection with loading functionality
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} config - Configuration options for withLoading
 * @param {number} [config.delay=0] - Delay in milliseconds before showing the component
 * @param {string} [config.loadingMessage] - Optional loading message to display
 * @returns {React.ComponentType} - The wrapped component with auth protection and loading functionality
 */
const withAuthProtection = (Component, config = {}) => {
  // First wrap the component with loading functionality
  const WithLoading = withLoading(Component, config);
  
  // Then add authentication protection
  const WithAuthProtection = (props) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (authLoading) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          <p className="text-lg mt-4 text-gray-600">
            Loading...
          </p>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the component with loading functionality
    return <WithLoading {...props} />;
  };

  // Set display name for debugging purposes
  const displayName = Component.displayName || Component.name || 'Component';
  WithAuthProtection.displayName = `withAuthProtection(${displayName})`;
  
  return WithAuthProtection;
};

export default withAuthProtection;