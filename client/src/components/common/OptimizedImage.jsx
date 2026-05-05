import { useEffect, useMemo, useRef, useState } from 'react';
import './OptimizedImage.css';

const PREDEFINED_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
];

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';

export default function OptimizedImage({
  src,
  alt = 'Image',
  className = '',
  placeholderText = '',
  objectFit = 'cover',
  rootMargin = '200px',
  eager = false,
  fallbackSrc = DEFAULT_FALLBACK,
  ...imgProps
}) {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(eager);
  const [loading, setLoading] = useState(Boolean(src));
  const [error, setError] = useState(false);

  const gradient = useMemo(() => {
    const seed = `${alt || ''}${src || ''}`;
    const index = seed.length % PREDEFINED_GRADIENTS.length;
    return PREDEFINED_GRADIENTS[index];
  }, [alt, src]);

  useEffect(() => {
    setLoading(Boolean(src));
    setError(false);
    if (eager) {
      setIsInView(true);
    }
  }, [src, eager]);

  useEffect(() => {
    if (eager || isInView || !containerRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [eager, isInView, rootMargin]);

  const showFallback = !src || error;
  const shouldRenderImage = showFallback || isInView;

  return (
    <div
      ref={containerRef}
      className={`optimized-image-container ${className}`}
      style={{ '--optimized-gradient': gradient }}
    >
      {(loading || !isInView) && !showFallback && <div className="image-skeleton-loader" />}

      {shouldRenderImage && (
        <img
          src={showFallback ? fallbackSrc : src}
          alt={showFallback ? 'Fallback' : alt}
          className={`optimized-image ${
            showFallback ? 'is-fallback' : loading ? 'is-loading' : 'is-loaded'
          }`}
          style={{ objectFit }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'low'}
          {...imgProps}
        />
      )}

      {showFallback && (
        <div className="image-overlay-placeholder">
          <span className="placeholder-text">{placeholderText || alt || 'Staylix Hotel'}</span>
        </div>
      )}
    </div>
  );
}
