import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserDashboard from './UserDashboard';
import ServiceProviderDashboard from './ServiceProviderDashboard';

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('Dashboard - User:', user); // Debug log
  console.log('Dashboard - isAuthenticated:', isAuthenticated); // Debug log
  console.log('Dashboard - loading:', loading); // Debug log

  return (
    <div className="page-container">
      <div className="section-container">
        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {user?.userType === 'service_provider' 
              ? 'Manage your services and track your earnings' 
              : 'Find and manage your service requests'
            }
          </p>
        </div>

        {/* Role-based Dashboard Content */}
        {user?.userType === 'service_provider' ? (
          <ServiceProviderDashboard />
        ) : (
          <UserDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
