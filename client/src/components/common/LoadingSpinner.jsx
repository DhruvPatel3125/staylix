import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 48, className = "", fullPage = false }) => {
  return (
    <div className={`loading ${fullPage ? 'full-page-loading' : ''} ${className}`}>
      <Loader2 size={size} className="spinner" />
    </div>
  );
};

export default LoadingSpinner;
