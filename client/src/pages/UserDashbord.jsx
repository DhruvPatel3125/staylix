import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import api from '../services/api';
import './UserDashbord.css';

/* ---------- SAFE DATE FORMATTER ---------- */
const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';

  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.bookings.getMyBookings();
      if (response.success) {
        setBookings(response.bookings || []);
      } else {
        setError(response.message || 'Failed to fetch bookings');
      }
    } catch {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setCancelingId(bookingId);
      const response = await api.bookings.cancel(bookingId);
      if (response.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      } else {
        setError(response.message || 'Failed to cancel booking');
      }
    } catch {
      setError('Failed to cancel booking');
    } finally {
      setCancelingId(null);
    }
  };

  /* ---------- SAFE BOOKING STATUS ---------- */
  const getBookingStatus = (booking) => {
    if (booking.status === 'cancelled') return 'Cancelled';

    if (!booking.checkOut) return 'Active';

    const checkOut = new Date(booking.checkOut);
    if (isNaN(checkOut.getTime())) return 'Active';

    return checkOut < new Date() ? 'Completed' : 'Active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#667eea';
      case 'Completed':
        return '#48bb78';
      case 'Cancelled':
        return '#f56565';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, {user?.name || 'User'}!</p>
        </div>

        <div className="dashboard-content">
          {/* ---------- SIDEBAR ---------- */}
          <aside className="dashboard-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <h3>{user?.name || 'User'}</h3>
                <p>{user?.email || 'N/A'}</p>
                <span className="role-badge">{user?.role || 'USER'}</span>
              </div>
            </div>

            <nav className="dashboard-nav">
              <button
                className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                📅 My Bookings
              </button>
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 Profile
              </button>
            </nav>
          </aside>

          {/* ---------- MAIN CONTENT ---------- */}
          <main className="dashboard-main">
            {error && <div className="error-banner">{error}</div>}

            {activeTab === 'bookings' && (
              <div className="bookings-section">
                <h2>My Bookings</h2>

                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <p>No bookings yet</p>
                    <p className="empty-text">
                      Start exploring and book your next hotel!
                    </p>
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
                                📍 {booking.hotelId?.location || 'Location not available'}
                              </p>
                            </div>

                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(status) }}
                            >
                              {status}
                            </span>
                          </div>

                          <div className="booking-details">
                            <div className="detail-item">
                              <span className="label">Check-in</span>
                              <span className="value">
                                {formatDate(booking.checkIn)}
                              </span>
                            </div>

                            <div className="detail-item">
                              <span className="label">Check-out</span>
                              <span className="value">
                                {formatDate(booking.checkOut)}
                              </span>
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

                          {status === 'Active' && booking.status !== 'cancelled' && (
                            <button
                              className="cancel-btn"
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancelingId === booking._id}
                            >
                              {cancelingId === booking._id
                                ? 'Cancelling...'
                                : 'Cancel Booking'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="profile-section">
                <h2>Profile Information</h2>
                <div className="profile-form">
                  <div className="form-group-static">
                    <label>Full Name</label>
                    <p>{user?.name || 'N/A'}</p>
                  </div>

                  <div className="form-group-static">
                    <label>Email</label>
                    <p>{user?.email || 'N/A'}</p>
                  </div>

                  <div className="form-group-static">
                    <label>Account Type</label>
                    <p className="role-badge-large">
                      {user?.role?.toUpperCase() || 'USER'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
