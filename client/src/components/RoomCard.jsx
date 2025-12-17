import './RoomCard.css';

export default function RoomCard({ room, onBooking }) {
  const isAvailable = room.availableRooms > 0;

  return (
    <div className="room-card">
      <div className="room-card-image">
        {room.photos?.[0] ? (
          <img src={room.photos[0]} alt={room.title} />
        ) : (
          <div className="room-placeholder">🛏️</div>
        )}
      </div>
      <div className="room-card-content">
        <h4>{room.title}</h4>
        <p className="room-type">Type: <strong>{room.roomType}</strong></p>
        <p className="room-capacity">Capacity: <strong>{room.availableRooms}/{room.totalRooms}</strong> available</p>
        
        {room.amenities && room.amenities.length > 0 && (
          <div className="room-amenities">
            {room.amenities.map((amenity, i) => (
              <span key={i} className="room-amenity">{amenity}</span>
            ))}
          </div>
        )}

        <div className="room-footer">
          <div className="room-price">
            <span className="price">${room.pricePerNight}</span>
            <span className="per-night">/night</span>
          </div>
          <button 
            className={`book-btn ${!isAvailable ? 'disabled' : ''}`}
            onClick={() => onBooking && onBooking(room)}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
