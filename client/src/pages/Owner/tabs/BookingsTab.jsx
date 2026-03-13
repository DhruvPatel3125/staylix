import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function BookingsTab() {
  const { 
    bookings,
    cancelingId,
    handleCancelReceivedBooking,
    getBookingDisplayStatus,
    getStatusColor
  } = useOutletContext();

  return (
    <div className="bookings-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <h2>Bookings for My Rooms (Received)</h2>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings yet</p>
          <p className="empty-text">Your room bookings will appear here</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => {
            const status = getBookingDisplayStatus(booking);
            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3>{booking.hotelId?.name || 'Hotel'}</h3>
                    <p className="booking-room">
                      🛏️ {booking.roomId?.title || 'Room'}
                    </p>
                  </div>
                  <div className="booking-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(status), color: 'white' }}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Guest</span>
                    <span className="value">{booking.userId?.name || 'Guest'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Check-in</span>
                    <span className="value">{new Date(booking.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Check-out</span>
                    <span className="value">{new Date(booking.checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Earnings</span>
                    <span className="value earnings">₹{(booking.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                {status === 'Active' && booking.bookingStatus !== 'cancelled' && (
                  <button 
                    className="cancel-btn"
                    onClick={() => handleCancelReceivedBooking(booking._id)}
                    disabled={cancelingId === booking._id}
                  >
                    {cancelingId === booking._id ? 'Processing...' : 'Cancel & Refund'}
                  </button>
                )}
                {booking.bookingStatus === 'cancelled' && booking.refundStatus === 'processed' && (
                  <div className="refund-status">
                    ✅ Refund Processed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
