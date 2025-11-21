// utils/dateUtils.js
export const formatDate = (dateValue, options = {}) => {
  if (!dateValue) return 'N/A';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString(undefined, { ...defaultOptions, ...options });
};

export const formatDateTime = (dateValue) => {
  if (!dateValue) return 'N/A';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleString();
};

export const formatTimeAgo = (dateValue) => {
  if (!dateValue) return 'N/A';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return date.toLocaleDateString();
};