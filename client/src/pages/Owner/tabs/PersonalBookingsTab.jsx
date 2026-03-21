import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, MapPin } from 'lucide-react';

export default function PersonalBookingsTab() {
  const { 
    personalBookings,
    cancelingId,
    handleCancelPersonalBooking,
    getBookingDisplayStatus,
    getStatusColor
  } = useOutletContext();

  return (
    <div className="bookings-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <h2>My Travel Bookings</h2>

      {personalBookings.length === 0 ? (
        <div className="empty-state">
          <p>No personal bookings yet</p>
          <p className="empty-text">Your own travel bookings will appear here</p>
        </div>
      ) : (
        <div className="bookings-list">
          {personalBookings.map(booking => {
            const status = getBookingDisplayStatus(booking);

            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3>{booking.hotelId?.name || 'Hotel'}</h3>
                    <p className="booking-room">
                      <MapPin size={14} /> {booking.hotelId?.address?.city || booking.hotelId?.city || 'Location N/A'}
                    </p>
                    <p className="booking-room">
                      🛏️ {booking.roomId?.title || booking.roomId?.roomType || 'Room'}
                    </p>
                  </div>

                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(status), color: 'white' }}
                  >
                    {status}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Check-in</span>
                    <span className="value">
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Check-out</span>
                    <span className="value">
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Room</span>
                    <span className="value">
                      {booking.roomId?.title || booking.roomId?.roomType || 'Room'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Total Price</span>
                    <span className="value price">
                      ₹{Number(booking.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {status === 'Active' && booking.bookingStatus !== 'cancelled' && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelPersonalBooking(booking._id)}
                    disabled={cancelingId === booking._id}
                  >
                    {cancelingId === booking._id ? '...' : <><Trash2 size={16} /> Cancel Booking</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
