import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import api from '../services/api';
import './AdminDashbord.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minBookingAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: ''
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingDiscountId, setRejectingDiscountId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [roomRequests, setRoomRequests] = useState([]);
  const [showRejectRoomModal, setShowRejectRoomModal] = useState(false);
  const [rejectingRoomId, setRejectingRoomId] = useState(null);
  const [roomRejectionReason, setRoomRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, usersRes, hotelsRes, roomsRes, requestsRes, discountsRes, roomRequestsRes] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getAllUsers(),
        api.admin.getAllHotels(),
        api.admin.getAllRooms(),
        api.admin.getOwnerRequests(),
        api.discounts.getAll(),
        api.admin.getRoomRequests()
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (usersRes.success) {
        setUsers(usersRes.users || []);
      }
      if (hotelsRes.success) {
        setHotels(hotelsRes.hotels || []);
      }
      if (roomsRes.success) {
        setRooms(roomsRes.rooms || []);
      }
      if (requestsRes.success) {
        setOwnerRequests(requestsRes.requests || []);
      }
      if (discountsRes.success) {
        setDiscounts(discountsRes.discounts || []);
      }
      if (roomRequestsRes.success) {
        setRoomRequests(roomRequestsRes.roomRequests || []);
      }
    } catch (_err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'blocked' ? 'unblock' : 'block'} this user?`)) return;

    try {
      setProcessingId(userId);
      const response = await api.admin.blockUser(userId);
      if (response.success) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u
        ));
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (_err) {
      setError('Failed to update user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setProcessingId(userId);
      const response = await api.admin.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (_err) {
      setError('Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) return;

    try {
      setProcessingId(hotelId);
      const response = await api.admin.deleteHotel(hotelId);
      if (response.success) {
        setHotels(hotels.filter(h => h._id !== hotelId));
      } else {
        setError(response.message || 'Failed to delete hotel');
      }
    } catch (_err) {
      setError('Failed to delete hotel');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;

    try {
      setProcessingId(roomId);
      const response = await api.admin.deleteRoom(roomId);
      if (response.success) {
        setRooms(rooms.filter(r => r._id !== roomId));
      } else {
        setError(response.message || 'Failed to delete room');
      }
    } catch (_err) {
      setError('Failed to delete room');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveOwner = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this owner request?')) return;

    try {
      setProcessingId(requestId);
      const response = await api.admin.approveOwnerRequest(requestId);
      if (response.success) {
        setOwnerRequests(ownerRequests.map(r =>
          r._id === requestId ? { ...r, status: 'approved' } : r
        ));
      } else {
        setError(response.message || 'Failed to approve request');
      }
    } catch (_err) {
      setError('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectOwner = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this owner request?')) return;

    try {
      setProcessingId(requestId);
      const response = await api.admin.rejectOwnerRequest(requestId);
      if (response.success) {
        setOwnerRequests(ownerRequests.map(r =>
          r._id === requestId ? { ...r, status: 'rejected' } : r
        ));
      } else {
        setError(response.message || 'Failed to reject request');
      }
    } catch (_err) {
      setError('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    
    if (!newDiscount.code || !newDiscount.description || !newDiscount.discountValue || !newDiscount.startDate || !newDiscount.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setProcessingId('creating-discount');
      const response = await api.discounts.create(newDiscount);
      if (response.success) {
        setDiscounts([...discounts, response.discount]);
        setNewDiscount({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          minBookingAmount: '',
          startDate: '',
          endDate: '',
          usageLimit: ''
        });
        setShowDiscountForm(false);
      } else {
        setError(response.message || 'Failed to create discount');
      }
    } catch (_err) {
      setError('Failed to create discount');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;

    try {
      setProcessingId(discountId);
      const response = await api.discounts.delete(discountId);
      if (response.success) {
        setDiscounts(discounts.filter(d => d._id !== discountId));
      } else {
        setError(response.message || 'Failed to delete discount');
      }
    } catch (_err) {
      setError('Failed to delete discount');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleDiscount = async (discountId) => {
    try {
      setProcessingId(discountId);
      const response = await api.discounts.toggle(discountId);
      if (response.success) {
        setDiscounts(discounts.map(d =>
          d._id === discountId ? { ...d, isActive: !d.isActive } : d
        ));
      } else {
        setError(response.message || 'Failed to toggle discount');
      }
    } catch (_err) {
      setError('Failed to toggle discount');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDiscountRequest = async (discountId) => {
    if (!window.confirm('Are you sure you want to approve this discount request?')) return;

    try {
      setProcessingId(discountId);
      const response = await api.discounts.approveRequest(discountId);
      if (response.success) {
        setDiscounts(discounts.map(d =>
          d._id === discountId ? { ...d, requestStatus: 'approved', isActive: true } : d
        ));
      } else {
        setError(response.message || 'Failed to approve discount request');
      }
    } catch (_err) {
      setError('Failed to approve discount request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleInitiateRejectDiscount = (discountId) => {
    setRejectingDiscountId(discountId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectDiscountRequest = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(rejectingDiscountId);
      const response = await api.discounts.rejectRequest(rejectingDiscountId, rejectionReason);
      if (response.success) {
        setDiscounts(discounts.map(d =>
          d._id === rejectingDiscountId ? { ...d, requestStatus: 'rejected', isActive: false, rejectionReason } : d
        ));
        setShowRejectModal(false);
        setRejectingDiscountId(null);
        setRejectionReason('');
      } else {
        setError(response.message || 'Failed to reject discount request');
      }
    } catch (_err) {
      setError('Failed to reject discount request');
    } finally {
      setProcessingId(null);
    }
  };


  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveRoomRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this room request? This will create the room.')) return;

    try {
      setProcessingId(requestId);
      const response = await api.admin.approveRoomRequest(requestId);
      if (response.success) {
        setRoomRequests(roomRequests.map(r =>
          r._id === requestId ? { ...r, status: 'approved' } : r
        ));
        // Refresh rooms list
        const roomsRes = await api.admin.getAllRooms();
        if (roomsRes.success) {
          setRooms(roomsRes.rooms || []);
        }
      } else {
        setError(response.message || 'Failed to approve room request');
      }
    } catch (_err) {
      setError('Failed to approve room request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleInitiateRejectRoom = (requestId) => {
    setRejectingRoomId(requestId);
    setRoomRejectionReason('');
    setShowRejectRoomModal(true);
  };

  const handleRejectRoomRequest = async () => {
    if (!roomRejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(rejectingRoomId);
      const response = await api.admin.rejectRoomRequest(rejectingRoomId, roomRejectionReason);
      if (response.success) {
        setRoomRequests(roomRequests.map(r =>
          r._id === rejectingRoomId ? { ...r, status: 'rejected', rejectionReason: roomRejectionReason } : r
        ));
        setShowRejectRoomModal(false);
        setRejectingRoomId(null);
        setRoomRejectionReason('');
      } else {
        setError(response.message || 'Failed to reject room request');
      }
    } catch (_err) {
      setError('Failed to reject room request');
    } finally {
      setProcessingId(null);
    }
  };


  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    room.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = ownerRequests.filter(r => r.status === 'pending');

  if (loading) {
    return <div className="admin-dashboard"><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}! Manage your platform here.</p>
        </div>

        <div className="dashboard-content">
          <aside className="dashboard-sidebar">
            <div className="profile-card">
              <div className="profile-avatar admin-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
                <span className="role-badge admin-badge">Admin</span>
              </div>
            </div>

            <nav className="dashboard-nav">
              <button
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
              <button
                className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Users
              </button>
              <button
                className={`nav-item ${activeTab === 'owner-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('owner-requests')}
              >
                🏨 Owner Requests
              </button>
              <button
                className={`nav-item ${activeTab === 'hotels' ? 'active' : ''}`}
                onClick={() => setActiveTab('hotels')}
              >
                🏢 Hotels
              </button>
              <button
                className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                🛏️ Rooms
              </button>
              <button
                className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                📈 Reports
              </button>
              <button
                className={`nav-item ${activeTab === 'room-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('room-requests')}
              >
                📝 Room Requests
              </button>
              <button
                className={`nav-item ${activeTab === 'discounts' ? 'active' : ''}`}
                onClick={() => setActiveTab('discounts')}
              >
                🏷️ Discounts
              </button>
            </nav>
          </aside>

          <main className="dashboard-main">
            {error && <div className="error-banner">{error}</div>}

            {activeTab === 'overview' && (
              <div className="overview-section">
                <h2>Overview</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#667eea' }}>
                      👥
                    </div>
                    <div className="stat-content">
                      <h3>Total Users</h3>
                      <p className="stat-value">{stats?.totalUsers || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#48bb78' }}>
                      🏨
                    </div>
                    <div className="stat-content">
                      <h3>Total Hotels</h3>
                      <p className="stat-value">{stats?.totalHotels || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#f6ad55' }}>
                      🛏️
                    </div>
                    <div className="stat-content">
                      <h3>Total Rooms</h3>
                      <p className="stat-value">{stats?.totalRooms || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#667eea' }}>
                      📅
                    </div>
                    <div className="stat-content">
                      <h3>Total Bookings</h3>
                      <p className="stat-value">{stats?.totalBookings || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#38b6ff' }}>
                      ⭐
                    </div>
                    <div className="stat-content">
                      <h3>Total Reviews</h3>
                      <p className="stat-value">{stats?.totalReviews || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#f56565' }}>
                      ⏳
                    </div>
                    <div className="stat-content">
                      <h3>Pending Requests</h3>
                      <p className="stat-value">{stats?.pendingOwnerRequests || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="summary-section">
                  <h3>Platform Summary</h3>
                  <div className="summary-list">
                    <div className="summary-item">
                      <span className="label">Active Users</span>
                      <span className="value">{stats?.activeUsers || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Blocked Users</span>
                      <span className="value">{stats?.blockedUsers || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Verified Owners</span>
                      <span className="value">{stats?.verifiedOwners || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Total Revenue</span>
                      <span className="value">${stats?.revenue?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-section">
                <div className="users-header">
                  <h2>User Management</h2>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="empty-state">
                    <p>{searchTerm ? 'No users found matching your search' : 'No users available'}</p>
                  </div>
                ) : (
                  <div className="users-table-wrapper">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u._id} className={u.isBlocked ? 'blocked-row' : ''}>
                            <td className="user-name">
                              <div className="user-avatar-mini">
                                {u.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              {u.name}
                            </td>
                            <td>{u.email}</td>
                            <td>
                              <span className="role-badge-table">
                                {u.role === 'owner' ? '🏨' : u.role === 'admin' ? '⚙️' : '👤'} {u.role}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${u.isBlocked ? 'blocked' : 'active'}`}>
                                {u.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className={`action-btn ${u.isBlocked ? 'unblock-btn' : 'block-btn'}`}
                                  onClick={() => handleBlockUser(u._id, u.isBlocked ? 'blocked' : 'active')}
                                  disabled={processingId === u._id}
                                >
                                  {processingId === u._id ? 'Processing...' : u.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteUser(u._id)}
                                  disabled={processingId === u._id}
                                >
                                  {processingId === u._id ? 'Processing...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'owner-requests' && (
              <div className="requests-section">
                <h2>Owner Requests</h2>
                {pendingRequests.length === 0 ? (
                  <div className="empty-state">
                    <p>No pending owner requests</p>
                  </div>
                ) : (
                  <div className="requests-grid">
                    {pendingRequests.map(request => (
                      <div key={request._id} className="request-card">
                        <div className="request-header">
                          <h3>{request.userId?.name}</h3>
                          <span className={`status-badge ${request.status}`}>{request.status}</span>
                        </div>
                        <div className="request-info">
                          <p><strong>Email:</strong> {request.userId?.email}</p>
                          <p><strong>Business Name:</strong> {request.businessName}</p>
                          <p><strong>Document:</strong> {request.document}</p>
                          <p><strong>Applied:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="request-actions">
                          <button
                            className="action-btn approve-btn"
                            onClick={() => handleApproveOwner(request._id)}
                            disabled={processingId === request._id}
                          >
                            {processingId === request._id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            className="action-btn reject-btn"
                            onClick={() => handleRejectOwner(request._id)}
                            disabled={processingId === request._id}
                          >
                            {processingId === request._id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="request-history">
                  <h3>Request History</h3>
                  <div className="requests-table-wrapper">
                    <table className="requests-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Business Name</th>
                          <th>Status</th>
                          <th>Applied Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ownerRequests.filter(r => r.status !== 'pending').map(request => (
                          <tr key={request._id} className={`status-${request.status}`}>
                            <td>{request.userId?.name}</td>
                            <td>{request.userId?.email}</td>
                            <td>{request.businessName}</td>
                            <td>
                              <span className={`status-badge ${request.status}`}>
                                {request.status}
                              </span>
                            </td>
                            <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="hotels-section">
                <div className="hotels-header">
                  <h2>Hotel Management</h2>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search hotels by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {filteredHotels.length === 0 ? (
                  <div className="empty-state">
                    <p>{searchTerm ? 'No hotels found matching your search' : 'No hotels available'}</p>
                  </div>
                ) : (
                  <div className="hotels-grid">
                    {filteredHotels.map(hotel => (
                      <div key={hotel._id} className="hotel-card">
                        <div className="hotel-header">
                          <h3>{hotel.name}</h3>
                          <span className={`active-badge ${hotel.isActive ? 'active' : 'inactive'}`}>
                            {hotel.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="hotel-info">
                          <p><strong>Owner:</strong> {hotel.ownerId?.name}</p>
                          <p><strong>Location:</strong> {hotel.address?.city}, {hotel.address?.state}, {hotel.address?.country}</p>
                          <p><strong>Rating:</strong> ⭐ {hotel.rating || 'Not rated'}</p>
                          <p><strong>Description:</strong> {hotel.description || 'N/A'}</p>
                        </div>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteHotel(hotel._id)}
                          disabled={processingId === hotel._id}
                        >
                          {processingId === hotel._id ? 'Deleting...' : 'Delete Hotel'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="rooms-section">
                <div className="rooms-header">
                  <h2>Room Management</h2>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search rooms by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {filteredRooms.length === 0 ? (
                  <div className="empty-state">
                    <p>{searchTerm ? 'No rooms found matching your search' : 'No rooms available'}</p>
                  </div>
                ) : (
                  <div className="rooms-table-wrapper">
                    <table className="rooms-table">
                      <thead>
                        <tr>
                          <th>Room Title</th>
                          <th>Type</th>
                          <th>Price/Night</th>
                          <th>Available</th>
                          <th>Hotel</th>
                          <th>Owner</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRooms.map(room => (
                          <tr key={room._id}>
                            <td>{room.title}</td>
                            <td><span className="type-badge">{room.roomType}</span></td>
                            <td>${room.pricePerNight}</td>
                            <td>{room.availableRooms}/{room.totalRooms}</td>
                            <td>{room.hotelId?.name}</td>
                            <td>{room.hotelId?.ownerId?.name}</td>
                            <td>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteRoom(room._id)}
                                disabled={processingId === room._id}
                              >
                                {processingId === room._id ? 'Deleting...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="reports-section">
                <h2>System Reports & Analytics</h2>
                <div className="reports-grid">
                  <div className="report-card">
                    <h3>📊 User Analytics</h3>
                    <div className="analytics-data">
                      <div className="analytics-item">
                        <span>Total Users:</span>
                        <strong>{stats?.totalUsers || 0}</strong>
                      </div>
                      <div className="analytics-item">
                        <span>Active Users:</span>
                        <strong>{stats?.activeUsers || 0}</strong>
                      </div>
                      <div className="analytics-item">
                        <span>Blocked Users:</span>
                        <strong>{stats?.blockedUsers || 0}</strong>
                      </div>
                      <div className="analytics-item">
                        <span>Verified Owners:</span>
                        <strong>{stats?.verifiedOwners || 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-card">
                    <h3>🏢 Property Analytics</h3>
                    <div className="analytics-data">
                      <div className="analytics-item">
                        <span>Total Hotels:</span>
                        <strong>{stats?.totalHotels || 0}</strong>
                      </div>
                      <div className="analytics-item">
                        <span>Total Rooms:</span>
                        <strong>{stats?.totalRooms || 0}</strong>
                      </div>
                      <div className="analytics-item">
                        <span>Average Rooms/Hotel:</span>
                        <strong>{stats?.totalHotels > 0 ? (stats?.totalRooms / stats?.totalHotels).toFixed(1) : 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-card">
                    <h3>📅 Booking Analytics</h3>
                    <div className="analytics-data">
                      <div className="analytics-item">
                        <span>Total Bookings:</span>
                        <strong>{stats?.totalBookings || 0}</strong>
                      </div>
                      <div className="analytics-item">
                        <span>Total Revenue:</span>
                        <strong>${stats?.revenue?.toLocaleString() || 0}</strong>
                      </div>
                      <div className="analytics-item">
                        <span>Avg Revenue/Booking:</span>
                        <strong>${stats?.totalBookings > 0 ? (stats?.revenue / stats?.totalBookings).toFixed(2) : 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-card">
                    <h3>⭐ Review Analytics</h3>
                    <div className="analytics-data">
                      <div className="analytics-item">
                        <span>Total Reviews:</span>
                        <strong>{stats?.totalReviews || 0}</strong>
                      </div>
                      <div className="analytics-item">
                        <span>Reviews/Booking:</span>
                        <strong>{stats?.totalBookings > 0 ? (stats?.totalReviews / stats?.totalBookings * 100).toFixed(1) : 0}%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="platform-health">
                  <h3>🏥 Platform Health</h3>
                  <div className="health-metrics">
                    <div className="health-item">
                      <div className="health-bar">
                        <div className="health-fill" style={{ width: '85%' }}></div>
                      </div>
                      <span>System Performance: Good</span>
                    </div>
                    <div className="health-item">
                      <div className="health-bar">
                        <div className="health-fill" style={{ width: '92%' }}></div>
                      </div>
                      <span>User Engagement: Excellent</span>
                    </div>
                    <div className="health-item">
                      <div className="health-bar">
                        <div className="health-fill" style={{ width: '78%' }}></div>
                      </div>
                      <span>Data Quality: Good</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'discounts' && (
              <div className="discounts-section">
                <div className="discounts-header">
                  <h2>Discounts & Offers</h2>
                  <button
                    className="action-btn approve-btn"
                    onClick={() => setShowDiscountForm(!showDiscountForm)}
                  >
                    {showDiscountForm ? '✕ Cancel' : '+ Create Discount'}
                  </button>
                </div>

                {showDiscountForm && (
                  <div className="discount-form-container">
                    <form className="discount-form" onSubmit={handleCreateDiscount}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Discount Code *</label>
                          <input
                            type="text"
                            placeholder="e.g., SAVE20"
                            value={newDiscount.code}
                            onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Type *</label>
                          <select
                            value={newDiscount.discountType}
                            onChange={(e) => setNewDiscount({ ...newDiscount, discountType: e.target.value })}
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Value *</label>
                          <input
                            type="number"
                            placeholder="20"
                            value={newDiscount.discountValue}
                            onChange={(e) => setNewDiscount({ ...newDiscount, discountValue: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Description *</label>
                          <input
                            type="text"
                            placeholder="e.g., Save 20% on all bookings"
                            value={newDiscount.description}
                            onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Min Booking Amount ($)</label>
                          <input
                            type="number"
                            placeholder="100"
                            value={newDiscount.minBookingAmount}
                            onChange={(e) => setNewDiscount({ ...newDiscount, minBookingAmount: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Usage Limit</label>
                          <input
                            type="number"
                            placeholder="Leave empty for unlimited"
                            value={newDiscount.usageLimit}
                            onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Start Date *</label>
                          <input
                            type="datetime-local"
                            value={newDiscount.startDate}
                            onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>End Date *</label>
                          <input
                            type="datetime-local"
                            value={newDiscount.endDate}
                            onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="action-btn approve-btn"
                        disabled={processingId === 'creating-discount'}
                      >
                        {processingId === 'creating-discount' ? 'Creating...' : 'Create Discount'}
                      </button>
                    </form>
                  </div>
                )}

                {discounts.length === 0 ? (
                  <div className="empty-state">
                    <p>No discounts available</p>
                  </div>
                ) : (
                  <div className="discounts-table-wrapper">
                    <table className="discounts-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Value</th>
                          <th>Min Amount</th>
                          <th>Usage</th>
                          <th>Valid Until</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discounts.map(discount => (
                          <tr key={discount._id}>
                            <td><strong>{discount.code}</strong></td>
                            <td>{discount.description}</td>
                            <td>{discount.discountType === 'percentage' ? '%' : '$'}</td>
                            <td>{discount.discountValue}</td>
                            <td>${discount.minBookingAmount || 0}</td>
                            <td>{discount.usageCount}{discount.usageLimit ? `/${discount.usageLimit}` : '/∞'}</td>
                            <td>{new Date(discount.endDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge ${discount.isActive ? 'active' : 'blocked'}`}>
                                {discount.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className={`action-btn ${discount.isActive ? 'block-btn' : 'unblock-btn'}`}
                                  onClick={() => handleToggleDiscount(discount._id)}
                                  disabled={processingId === discount._id}
                                >
                                  {processingId === discount._id ? 'Processing...' : discount.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteDiscount(discount._id)}
                                  disabled={processingId === discount._id}
                                >
                                  {processingId === discount._id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'room-requests' && (
              <div className="room-requests-section">
                <h2>Room Addition Requests</h2>
                
                {roomRequests.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="empty-state">
                    <p>No pending room requests</p>
                  </div>
                ) : (
                  <div className="requests-grid">
                    {roomRequests.filter(r => r.status === 'pending').map(request => (
                      <div key={request._id} className="request-card">
                        <div className="request-header">
                          <h3>{request.hotelId?.name || 'Hotel'}</h3>
                          <span className="status-badge pending">Pending</span>
                        </div>
                        <div className="request-info">
                          <p><strong>Owner:</strong> {request.ownerId?.name}</p>
                          <p><strong>Room Type:</strong> {request.roomType}</p>
                          <p><strong>Price/Night:</strong> ${request.pricePerNight}</p>
                          <p><strong>Total Rooms:</strong> {request.totalRooms}</p>
                          <p><strong>Available:</strong> {request.availableRooms}</p>
                          {request.amenities && request.amenities.length > 0 && (
                            <p><strong>Amenities:</strong> {request.amenities.join(', ')}</p>
                          )}
                          {request.description && (
                            <p><strong>Description:</strong> {request.description}</p>
                          )}
                          <p className="date"><strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="request-actions">
                          <button
                            className="action-btn approve-btn"
                            onClick={() => handleApproveRoomRequest(request._id)}
                            disabled={processingId === request._id}
                          >
                            {processingId === request._id ? 'Processing...' : 'Approve & Create Room'}
                          </button>
                          <button
                            className="action-btn reject-btn"
                            onClick={() => handleInitiateRejectRoom(request._id)}
                            disabled={processingId === request._id}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {roomRequests.filter(r => r.status !== 'pending').length > 0 && (
                  <div className="request-history">
                    <h3>Request History</h3>
                    <div className="requests-table-wrapper">
                      <table className="requests-table">
                        <thead>
                          <tr>
                            <th>Hotel</th>
                            <th>Owner</th>
                            <th>Room Type</th>
                            <th>Price</th>
                            <th>Rooms</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomRequests.filter(r => r.status !== 'pending').map(request => (
                            <tr key={request._id} className={`status-${request.status}`}>
                              <td>{request.hotelId?.name}</td>
                              <td>{request.ownerId?.name}</td>
                              <td>{request.roomType}</td>
                              <td>${request.pricePerNight}</td>
                              <td>{request.availableRooms}/{request.totalRooms}</td>
                              <td>
                                <span className={`status-badge ${request.status}`}>
                                  {request.status}
                                </span>
                              </td>
                              <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                              <td>{request.rejectionReason || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showRejectRoomModal && (
              <div className="modal-overlay" onClick={() => setShowRejectRoomModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Reject Room Request</h3>
                  <p>Please provide a reason for rejecting this room request:</p>
                  <textarea
                    value={roomRejectionReason}
                    onChange={(e) => setRoomRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    rows="4"
                    style={{ width: '100%', padding: '8px', marginTop: '12px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                  />
                  <div className="modal-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      className="action-btn"
                      onClick={() => setShowRejectRoomModal(false)}
                      style={{ backgroundColor: '#cbd5e0', color: '#2d3748' }}
                    >
                      Cancel
                    </button>
                    <button
                      className="action-btn reject-btn"
                      onClick={handleRejectRoomRequest}
                      disabled={processingId === rejectingRoomId}
                    >
                      {processingId === rejectingRoomId ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
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
