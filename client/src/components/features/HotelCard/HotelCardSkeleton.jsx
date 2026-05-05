import './HotelCardSkeleton.css';

export default function HotelCardSkeleton() {
  return (
    <div className="hotel-card skeleton-card">
      <div className="hotel-card-image skeleton-shimmer"></div>
      <div className="hotel-card-content">
        <div className="skeleton-line title skeleton-shimmer"></div>
        <div className="skeleton-line location skeleton-shimmer"></div>
        <div className="skeleton-line description skeleton-shimmer"></div>
        <div className="skeleton-line description short skeleton-shimmer"></div>
        <div className="skeleton-amenities">
          <div className="skeleton-tag skeleton-shimmer"></div>
          <div className="skeleton-tag skeleton-shimmer"></div>
          <div className="skeleton-tag skeleton-shimmer"></div>
        </div>
        <div className="skeleton-footer skeleton-shimmer"></div>
      </div>
    </div>
  );
}
