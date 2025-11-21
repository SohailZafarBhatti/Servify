import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Higher-Order Component (HOC) that adds loading functionality to a component
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} config - Configuration options
 * @param {number} [config.delay=0] - Delay in milliseconds before showing the component
 * @param {string} [config.loadingMessage] - Optional loading message to display
 * @returns {React.ComponentType} - The wrapped component with loading functionality
 */
const withLoading = (Component, config = {}) => {
  const { delay = 0, loadingMessage } = config;
  
  const WithLoading = (props) => {
    const [loading, setLoading] = useState(delay > 0);
    
    useEffect(() => {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setLoading(false);
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }, []);
    
    if (loading || props.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <LoadingSpinner />
          {loadingMessage && <p className="text-center mt-4 text-gray-600">{loadingMessage}</p>}
        </div>
      );
    }
    
    return <Component {...props} />;
  };

  // Set display name for debugging purposes
  const displayName = Component.displayName || Component.name || 'Component';
  WithLoading.displayName = `withLoading(${displayName})`;
  
  return WithLoading;
};

export default withLoading;