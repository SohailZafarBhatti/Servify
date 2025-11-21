import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingButton = ({
  children,
  isLoading,
  loadingText,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  onClick,
  ...props
}) => {
  // Determine button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'outline':
        return 'btn-outline';
      case 'danger':
        return 'btn-danger';
      default:
        return 'btn-primary';
    }
  };

  return (
    <button
      type={type}
      className={`${getButtonStyle()} flex items-center justify-center ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="small" color="white" />
          <span className="ml-2">{loadingText || 'Loading...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;