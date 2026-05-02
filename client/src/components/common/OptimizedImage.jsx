import { useState, useEffect } from 'react';
import './OptimizedImage.css';

const PREDEFINED_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
];

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  placeholderText = '', 
  objectFit = 'cover' 
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [gradient, setGradient] = useState('');

  useEffect(() => {
    // Select a stable gradient based on the alt text or src
    const index = (alt?.length || 0) % PREDEFINED_GRADIENTS.length;
    setGradient(PREDEFINED_GRADIENTS[index]);
    
    // Reset state if src changes
    setLoading(true);
    setError(false);
  }, [src, alt]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (error || !src) {
    return (
      <div 
        className={`optimized-image-placeholder ${className}`}
        style={{ background: gradient }}
      >
        <span className="placeholder-char">
          {placeholderText || alt?.charAt(0) || 'H'}
        </span>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`}>
      {loading && <div className="image-skeleton-loader" />}
      <img
        src={src}
        alt={alt}
        className={`optimized-image ${loading ? 'is-loading' : 'is-loaded'}`}
        style={{ objectFit }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}
