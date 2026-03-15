import './RoomCard.css';
import { getImageUrl } from '../../../utils/imageUrl';

export default function RoomCard({ room, onBooking }) {
  const availableCount = room.liveAvailableCount !== undefined ? room.liveAvailableCount : room.totalRooms;
  const isAvailable = room.isSoldOut !== undefined ? !room.isSoldOut : availableCount > 0;

  return (
    <div className={`room-card ${!isAvailable ? 'sold-out' : ''}`}>
      <div className="room-card-image">
        {room.image || room.photos?.[0] ? (
          <img src={getImageUrl(room.image || room.photos?.[0])} alt={room.title} />
        ) : (
          <div className="room-placeholder">🛏️</div>
        )}
        {!isAvailable && <div className="sold-out-overlay">Sold Out</div>}
      </div>
      <div className="room-card-content">
        <h4>{room.title}</h4>
        <p className="room-type">Type: <strong>{room.roomType}</strong></p>
        <p className="room-capacity">
          Capacity: <strong>{availableCount}/{room.totalRooms}</strong> available
        </p>
        
        {room.amenities && room.amenities.length > 0 && (
          <div className="room-amenities">
            {room.amenities.map((amenity, i) => (
              <span key={i} className="room-amenity">{amenity}</span>
            ))}
          </div>
        )}

        <div className="room-footer">
          <div className="room-price">
            <span className="price">₹{room.pricePerNight}</span>
            <span className="per-night">/night</span>
          </div>
          <button 
            className={`book-btn ${!isAvailable ? 'disabled' : ''}`}
            onClick={() => onBooking && onBooking(room)}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Book Now' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
