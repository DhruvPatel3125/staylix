import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { MapPin, Hotel, Heart } from 'lucide-react';

export default function WishlistTab() {
  const { 
    wishlistedHotels, 
    wishlistLoading, 
    dispatch, 
    toggleWishlist, 
    toggleWishlistLocal, 
    getImageUrl 
  } = useOutletContext();

  return (
    <div className="wishlist-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <h2>My Wishlist</h2>
      
      {wishlistLoading ? (
        <div className="empty-state">
          <p>Loading wishlist...</p>
        </div>
      ) : wishlistedHotels.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} className="icon-muted" />
          <p>No items in wishlist</p>
          <p className="empty-text">Save hotels you like and they will appear here.</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistedHotels.map((hotel) => (
            <div key={hotel._id} className="wishlist-card">
              <Link to={`/hotel/${hotel._id}`} className="wishlist-card-image">
                {hotel.photos?.[0] ? (
                  <img src={getImageUrl(hotel.photos[0])} alt={hotel.name} loading="lazy" />
                ) : (
                  <div className="wishlist-placeholder">
                    <Hotel size={32} />
                  </div>
                )}
              </Link>
              <div className="wishlist-card-content">
                <h3>{hotel.name}</h3>
                <p className="wishlist-location">
                  <MapPin size={14} />
                  <span>{hotel.address?.city}, {hotel.address?.country || hotel.address?.state}</span>
                </p>
                <div className="wishlist-actions">
                  <Link to={`/hotel/${hotel._id}`} className="wishlist-view-btn">
                    View Details
                  </Link>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => {
                      const payload = { hotelId: hotel._id, hotel };
                      dispatch(toggleWishlistLocal(payload));
                      dispatch(toggleWishlist(payload));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
