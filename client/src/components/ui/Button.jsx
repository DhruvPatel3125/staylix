import React from 'react';
import './Button.css';
import LoadingSpinner from '../common/LoadingSpinner';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  disabled = false, 
  type = 'button',
  icon: Icon,
  onClick,
  ...props 
}) {
  const baseClass = `ui-btn btn-${variant} btn-${size}`;
  const finalClass = `${baseClass} ${className}`;

  return (
    <button 
      type={type} 
      className={finalClass} 
      onClick={onClick} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-loader">
           {/* Simple spinner if LoadingSpinner is too complex for this, but let's try to use it or a simple span */}
           <span className="spinner-sm"></span>
        </span>
      ) : Icon ? (
        <span className="btn-icon-wrapper">
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
