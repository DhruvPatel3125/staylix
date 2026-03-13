import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Trash2, Calendar } from 'lucide-react';

export default function BookingsTab() {
  const { 
    bookings, 
    cancelingId, 
    handleCancelBooking, 
    getBookingStatus, 
    getStatusColor, 
    formatDate 
  } = useOutletContext();

  return (
    <div className="bookings-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings yet</p>
          <p className="empty-text">Start exploring and book your next hotel!</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const status = getBookingStatus(booking);

            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3>{booking.hotelId?.name || 'Hotel'}</h3>
                    <p className="booking-location">
                      <MapPin size={16} /> {booking.hotelId?.address?.city || booking.hotelId?.city || 'Location not available'}
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
                    <span className="value">{formatDate(booking.checkIn)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Check-out</span>
                    <span className="value">{formatDate(booking.checkOut)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Room</span>
                    <span className="value">
                      {booking.roomId?.type || booking.roomId?.roomType || booking.roomId?.title || 'Room'}
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
                    onClick={() => handleCancelBooking(booking._id)}
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
