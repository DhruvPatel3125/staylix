import { Link } from 'react-router-dom';
import './HotelCard.css';
import { getImageUrl } from '../utils/imageUrl';

export default function HotelCard({ hotel }) {
  return (
    <Link to={`/hotel/${hotel._id}`} className="hotel-card-link">
      <div className="hotel-card">
        <div className="hotel-card-image">
          {hotel.photos?.[0] ? (
            <img src={getImageUrl(hotel.photos[0])} alt={hotel.name} />
          ) : (
            <div className="hotel-placeholder">🏨</div>
          )}
        </div>
        <div className="hotel-card-content">
          <h3>{hotel.name}</h3>
          <p className="hotel-location">
            📍 {hotel.address?.city}, {hotel.address?.state}
          </p>
          <p className="hotel-description">{hotel.description}</p>
          <div className="hotel-amenities">
            {hotel.amenities?.slice(0, 3).map((amenity, i) => (
              <span key={i} className="amenity-tag">{amenity}</span>
            ))}
            {hotel.amenities?.length > 3 && (
              <span className="amenity-tag">+{hotel.amenities.length - 3}</span>
            )}
          </div>
          <div className="hotel-rating">
            ⭐ {hotel.rating || 'Not rated'}
          </div>
        </div>
      </div>
    </Link>
  );
}
