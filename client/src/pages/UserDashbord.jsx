import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import api from '../services/api';
import './UserDashbord.css';

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
  const [ownerRequest, setOwnerRequest] = useState(null);
  const [showOwnerRequestForm, setShowOwnerRequestForm] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [ownerRequestData, setOwnerRequestData] = useState({
    businessName: '',
    document: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsRes, requestRes] = await Promise.all([
        api.bookings.getMyBookings(),
        api.ownerRequest.getAll()
      ]);
      if (bookingsRes.success) {
        setBookings(bookingsRes.bookings || []);
      }
      if (requestRes.success && requestRes.requests && requestRes.requests.length > 0) {
        setOwnerRequest(requestRes.requests[0]);
      }
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOwnerRequest = async () => {
    if (!ownerRequestData.businessName.trim() || !ownerRequestData.document) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingRequest(true);
      const formData = new FormData();
      formData.append('businessName', ownerRequestData.businessName);
      formData.append('document', ownerRequestData.document);

      const response = await api.ownerRequest.create(formData);
      if (response.success) {
        setOwnerRequest(response.request);
        setOwnerRequestData({ businessName: '', document: null });
        setShowOwnerRequestForm(false);
      } else {
        setError(response.message || 'Failed to submit request');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setCancelingId(bookingId);
      const response = await api.bookings.cancel(bookingId);
      if (response.success) {
        setBookings(prev => prev.map(b => 
          b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b
        ));
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
    if (booking.bookingStatus === 'cancelled') return 'Cancelled';

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
                className={`nav-item ${activeTab === 'owner-request' ? 'active' : ''}`}
                onClick={() => setActiveTab('owner-request')}
              >
                🏢 Become Owner
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

                          {status === 'Active' && booking.bookingStatus !== 'cancelled' && (
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

            {activeTab === 'owner-request' && (
              <div className="owner-request-section">
                <h2>Become an Owner</h2>
                <p className="section-subtitle">Submit your application to become a hotel owner and manage your properties</p>

                {ownerRequest ? (
                  <div className="request-status-card">
                    <div className="status-header">
                      <h3>Your Owner Request</h3>
                      <span className={`status-badge ${ownerRequest.status}`}>
                        {ownerRequest.status.charAt(0).toUpperCase() + ownerRequest.status.slice(1)}
                      </span>
                    </div>
                    <div className="status-details">
                      <div className="detail-item">
                        <span className="label">Business Name</span>
                        <span className="value">{ownerRequest.businessName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Document</span>
                        <span className="value">
                          <a 
                            href={`http://localhost:5000/${ownerRequest.document.replace(/\\/g, '/')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#3182ce', textDecoration: 'underline' }}
                          >
                            View Document
                          </a>
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Submitted On</span>
                        <span className="value">{new Date(ownerRequest.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {ownerRequest.status === 'pending' && (
                      <p className="pending-message">
                        ⏳ Your request is under review. Admin will approve or reject it soon.
                      </p>
                    )}
                    {ownerRequest.status === 'approved' && (
                      <p className="approved-message" style={{ color: '#48bb78', marginTop: '12px' }}>
                        ✅ Congratulations! Your request has been approved. You can now manage hotels and rooms.
                      </p>
                    )}
                    {ownerRequest.status === 'rejected' && (
                      <p className="rejected-message" style={{ color: '#f56565', marginTop: '12px' }}>
                        ❌ Your request was rejected. Please contact support for more information.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="request-form-container">
                      {!showOwnerRequestForm ? (
                        <button
                          className="submit-btn"
                          onClick={() => setShowOwnerRequestForm(true)}
                          style={{ padding: '12px 24px', fontSize: '16px' }}
                        >
                          📝 Submit Owner Request
                        </button>
                      ) : (
                        <div className="form-content">
                          <h3>Submit Your Application</h3>
                          <div className="form-group">
                            <label>Business Name *</label>
                            <input
                              type="text"
                              value={ownerRequestData.businessName}
                              onChange={(e) => setOwnerRequestData({ ...ownerRequestData, businessName: e.target.value })}
                              placeholder="Enter your business name"
                              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                            />
                          </div>

                          <div className="form-group">
                            <label>Document/License *</label>
                            <input
                              type="file"
                              onChange={(e) => setOwnerRequestData({ ...ownerRequestData, document: e.target.files[0] })}
                              accept="image/*,.pdf"
                              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                            />
                            <small style={{ display: 'block', marginTop: '5px', color: '#718096' }}>
                              Upload your business license or proof of ownership (Image or PDF)
                            </small>
                          </div>

                          <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button
                              className="submit-btn"
                              onClick={handleSubmitOwnerRequest}
                              disabled={submittingRequest}
                              style={{ flex: 1 }}
                            >
                              {submittingRequest ? 'Submitting...' : '✓ Submit Request'}
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={() => setShowOwnerRequestForm(false)}
                              disabled={submittingRequest}
                              style={{ flex: 1 }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="info-box" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#edf2f7', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                      <h4 style={{ marginTop: 0 }}>What you'll need:</h4>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>Business name or hotel name</li>
                        <li>Valid business license or registration number</li>
                        <li>Proof of ownership or authorization</li>
                      </ul>
                    </div>
                  </>
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
