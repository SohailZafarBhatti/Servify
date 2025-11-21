import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === 'admin' ? (
        children
      ) : (
        <div className="flex flex-col justify-center items-center min-h-[80vh] text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            You don't have permission to access this page. Admin privileges are required.
          </p>
          <button
            className="btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default AdminRoute;
