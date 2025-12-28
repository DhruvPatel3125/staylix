import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import './HotelCard.css';
import { getImageUrl } from '../utils/imageUrl';

export default function HotelCard({ hotel }) {
  return (
    <Link to={`/hotel/${hotel._id}`} className="hotel-card-link">
      <div className="hotel-card premium-hotel-card-main">
        <div className="hotel-card-image">
          {hotel.photos?.[0] ? (
            <img src={getImageUrl(hotel.photos[0])} alt={hotel.name} loading="lazy" />
          ) : (
            <div className="hotel-placeholder">
              <ShieldCheck size={48} />
            </div>
          )}
          <div className="card-badge-rating">
            <Star size={14} fill="currentColor" />
            <span>{hotel.rating || 'N/A'}</span>
          </div>
        </div>
        <div className="hotel-card-content">
          <h3 className="card-title">{hotel.name}</h3>
          <p className="hotel-location">
            <MapPin size={16} />
            <span>{hotel.address?.city}, {hotel.address?.country || hotel.address?.state}</span>
          </p>
          <p className="hotel-description">{hotel.description}</p>
          <div className="hotel-amenities">
            {hotel.amenities?.slice(0, 3).map((amenity, i) => (
              <span key={i} className="amenity-tag">{amenity}</span>
            ))}
            {hotel.amenities?.length > 3 && (
              <span className="amenity-tag-plus">+{hotel.amenities.length - 3}</span>
            )}
          </div>
          <div className="card-footer-actions">
            <button className="view-details-btn-premium">
              View Details <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
