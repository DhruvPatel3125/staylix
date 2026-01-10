import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { 
  Users, 
  Hotel, 
  Bed, 
  Calendar, 
  X, 
  Star, 
  Clock, 
  PieChart, 
  Tag, 
  LayoutDashboard, 
  ShieldAlert, 
  CheckCircle, 
  Trash2, 
  Search,
  UserCheck,
  UserPlus,
  ArrowRight,
  MapPin,
  Plus
} from 'lucide-react';
import { showToast, showAlert } from '../../utils/swal';
import api, { API_BASE_URL } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import StatCard from '../../components/ui/StatCard';
import './AdminDashboard.css';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, usersRes, hotelsRes, roomsRes, requestsRes, discountsRes] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getAllUsers(),
        api.admin.getAllHotels(),
        api.admin.getAllRooms(),
        api.admin.getOwnerRequests(),
        api.discounts.getAll()
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
    } catch (_err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    const confirmed = await showAlert.confirm(
      'Confirm Action',
      `Are you sure you want to ${currentStatus === 'blocked' ? 'unblock' : 'block'} this user?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(userId);
      const response = await api.admin.blockUser(userId);
      if (response.success) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u
        ));
        showToast.success(`User ${currentStatus === 'blocked' ? 'unblocked' : 'blocked'} successfully`);
      } else {
        showAlert.error('Error', response.message || 'Failed to update user');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to update user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = await showAlert.confirm(
      'Delete User?',
      'Are you sure you want to delete this user? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setProcessingId(userId);
      const response = await api.admin.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
        showToast.success('User deleted successfully');
      } else {
        showAlert.error('Error', response.message || 'Failed to delete user');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    const confirmed = await showAlert.confirm(
      'Delete Hotel?',
      'Are you sure you want to delete this hotel? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setProcessingId(hotelId);
      const response = await api.admin.deleteHotel(hotelId);
      if (response.success) {
        setHotels(hotels.filter(h => h._id !== hotelId));
        showToast.success('Hotel deleted successfully');
      } else {
        showAlert.error('Error', response.message || 'Failed to delete hotel');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to delete hotel');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmed = await showAlert.confirm(
      'Delete Room?',
      'Are you sure you want to delete this room? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setProcessingId(roomId);
      const response = await api.admin.deleteRoom(roomId);
      if (response.success) {
        setRooms(rooms.filter(r => r._id !== roomId));
        showToast.success('Room deleted successfully');
      } else {
        showAlert.error('Error', response.message || 'Failed to delete room');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to delete room');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveOwner = async (requestId) => {
    const confirmed = await showAlert.confirm(
      'Approve Request?',
      'Are you sure you want to approve this owner request?'
    );

    if (!confirmed) return;

    try {
      setProcessingId(requestId);
      const response = await api.admin.approveOwnerRequest(requestId);
      if (response.success) {
        setOwnerRequests(ownerRequests.map(r =>
          r._id === requestId ? { ...r, status: 'approved' } : r
        ));
        showToast.success('Owner request approved');
      } else {
        showAlert.error('Error', response.message || 'Failed to approve request');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectOwner = async (requestId) => {
    const confirmed = await showAlert.confirm(
      'Reject Request?',
      'Are you sure you want to reject this owner request?'
    );

    if (!confirmed) return;

    try {
      setProcessingId(requestId);
      const response = await api.admin.rejectOwnerRequest(requestId);
      if (response.success) {
        setOwnerRequests(ownerRequests.map(r =>
          r._id === requestId ? { ...r, status: 'rejected' } : r
        ));
        showToast.success('Owner request rejected');
      } else {
        showAlert.error('Error', response.message || 'Failed to reject request');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    
    if (!newDiscount.code || !newDiscount.description || !newDiscount.discountValue || !newDiscount.startDate || !newDiscount.endDate) {
      showToast.error('Please fill in all required fields');
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
        showToast.success('Discount created successfully');
      } else {
        showAlert.error('Error', response.message || 'Failed to create discount');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to create discount');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    const confirmed = await showAlert.confirm(
      'Delete Discount?',
      'Are you sure you want to delete this discount?'
    );

    if (!confirmed) return;

    try {
      setProcessingId(discountId);
      const response = await api.discounts.delete(discountId);
      if (response.success) {
        setDiscounts(discounts.filter(d => d._id !== discountId));
        showToast.success('Discount deleted successfully');
      } else {
        showAlert.error('Error', response.message || 'Failed to delete discount');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to delete discount');
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
        showToast.success(`Discount ${response.discount.isActive ? 'activated' : 'deactivated'}`);
      } else {
        showAlert.error('Error', response.message || 'Failed to toggle discount');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to toggle discount');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDiscountRequest = async (discountId) => {
    const confirmed = await showAlert.confirm(
      'Approve Discount?',
      'Are you sure you want to approve this discount request?'
    );

    if (!confirmed) return;

    try {
      setProcessingId(discountId);
      const response = await api.discounts.approveRequest(discountId);
      if (response.success) {
        setDiscounts(discounts.map(d =>
          d._id === discountId ? { ...d, requestStatus: 'approved', isActive: true } : d
        ));
        showToast.success('Discount request approved');
      } else {
        showAlert.error('Error', response.message || 'Failed to approve discount request');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to approve discount request');
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
      showToast.error('Please provide a reason for rejection');
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
        showToast.success('Discount request rejected');
      } else {
        showAlert.error('Error', response.message || 'Failed to reject discount request');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to reject discount request');
    } finally {
      setProcessingId(null);
    }
  };


  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    room.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = ownerRequests.filter(r => r.status === 'pending');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'owner-requests', label: 'Owner Requests', icon: UserPlus },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'rooms', label: 'Rooms', icon: Bed },
    { id: 'reports', label: 'Reports', icon: LayoutDashboard },
    { id: 'discounts', label: 'Discounts', icon: Tag }
  ];

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}! Manage your platform here.</p>
        </div>

        <div className="dashboard-content">
          <Sidebar 
            items={sidebarItems} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          <main className="dashboard-main">
            {error && <div className="error-banner">{error}</div>}

            {activeTab === 'overview' && (
              <div className="overview-section">
                <h2>Overview</h2>
                <div className="stats-grid">
                  <StatCard 
                    title="Total Users" 
                    value={stats?.totalUsers || 0} 
                    icon={Users} 
                    iconColor="#6366f1" 
                    iconBg="rgba(99, 102, 241, 0.1)" 
                  />
                  <StatCard 
                    title="Total Hotels" 
                    value={stats?.totalHotels || 0} 
                    icon={Hotel} 
                    iconColor="#10b981" 
                    iconBg="rgba(16, 185, 129, 0.1)" 
                  />
                  <StatCard 
                    title="Total Rooms" 
                    value={stats?.totalRooms || 0} 
                    icon={Bed} 
                    iconColor="#f59e0b" 
                    iconBg="rgba(245, 158, 11, 0.1)" 
                  />
                  <StatCard 
                    title="Total Bookings" 
                    value={stats?.totalBookings || 0} 
                    icon={Calendar} 
                    iconColor="#6366f1" 
                    iconBg="rgba(99, 102, 241, 0.1)" 
                  />
                  <StatCard 
                    title="Cancelled Bookings" 
                    value={stats?.cancelledBookings || 0} 
                    icon={X} 
                    iconColor="#ef4444" 
                    iconBg="rgba(239, 68, 68, 0.1)" 
                  />
                  <StatCard 
                    title="Total Reviews" 
                    value={stats?.totalReviews || 0} 
                    icon={Star} 
                    iconColor="#3b82f6" 
                    iconBg="rgba(59, 130, 246, 0.1)" 
                  />
                  <StatCard 
                    title="Pending Requests" 
                    value={stats?.pendingOwnerRequests || 0} 
                    icon={Clock} 
                    iconColor="#f43f5e" 
                    iconBg="rgba(244, 63, 94, 0.1)" 
                  />
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
                                {u.role === 'owner' ? <Hotel size={14} /> : u.role === 'admin' ? <ShieldAlert size={14} /> : <Users size={14} />} {u.role}
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
                                  {processingId === u._id ? '...' : (u.isBlocked ? <UserCheck size={16} /> : <ShieldAlert size={16} />)} {u.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteUser(u._id)}
                                  disabled={processingId === u._id}
                                >
                                  {processingId === u._id ? '...' : <Trash2 size={16} />}
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
                          <p><strong>Document:</strong> <a href={`${API_BASE_URL}/${request.document.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce', textDecoration: 'underline' }}>View Document</a></p>
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
                <div className="hotels-header section-header-premium">
                  <div className="header-titles">
                    <h2>Hotel Management</h2>
                    <span className="count-badge">{filteredHotels.length} Properties</span>
                  </div>
                  <div className="header-actions">
                    <div className="search-wrapper">
                      <Search size={18} className="search-icon-inside" />
                      <input
                        type="text"
                        className="search-input-premium"
                        placeholder="Search hotels by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {filteredHotels.length === 0 ? (
                  <div className="empty-state">
                    <p>{searchTerm ? 'No hotels found matching your search' : 'No hotels available'}</p>
                  </div>
                ) : (
                  <div className="hotels-grid">
                    {filteredHotels.map(hotel => (
                      <div key={hotel._id} className="hotel-card premium-hotel-card">
                        <div className="hotel-premium-status">
                          <span className={`status-pill ${hotel.isActive ? 'active' : 'inactive'}`}>
                            {hotel.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="hotel-card-body">
                          <h3 className="hotel-title">{hotel.name}</h3>
                          <div className="hotel-meta">
                            <div className="meta-item">
                              <Users size={16} />
                              <span className="meta-label">Owner:</span>
                              <span className="meta-value">{hotel.ownerId?.name || 'Unknown'}</span>
                            </div>
                            <div className="meta-item">
                              <MapPin size={16} />
                              <span className="meta-label">Location:</span>
                              <span className="meta-value">{hotel.address?.city}, {hotel.address?.country}</span>
                            </div>
                            <div className="meta-item">
                              <Star size={16} className="star-icon" />
                              <span className="meta-label">Rating:</span>
                              <span className="meta-value">{hotel.rating || 'N/A'}</span>
                            </div>
                          </div>
                          <p className="hotel-description-compact">
                            {hotel.description ? (hotel.description.length > 100 ? `${hotel.description.substring(0, 100)}...` : hotel.description) : 'No description available'}
                          </p>
                        </div>
                        <div className="hotel-card-actions">
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteHotel(hotel._id)}
                            disabled={processingId === hotel._id}
                          >
                            {processingId === hotel._id ? '...' : <><Trash2 size={16} /> Delete Hotel</>}
                          </button>
                        </div>
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
                                title="Delete Room"
                              >
                                {processingId === room._id ? '...' : <Trash2 size={16} />}
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
                    <div className="report-card-header">
                      <Users size={24} className="report-icon users" />
                      <h3>User Analytics</h3>
                    </div>
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
                    <div className="report-card-header">
                      <Hotel size={24} className="report-icon hotels" />
                      <h3>Property Insights</h3>
                    </div>
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
                    <div className="report-card-header">
                      <Calendar size={24} className="report-icon bookings" />
                      <h3>Booking Trends</h3>
                    </div>
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
                    <div className="report-card-header">
                      <Star size={24} className="report-icon reviews" />
                      <h3>Review Analytics</h3>
                    </div>
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
                <div className="discounts-header section-header-premium">
                  <div className="header-titles">
                    <h2>Discounts & Offers</h2>
                    <span className="count-badge">{discounts.length} Active Rewards</span>
                  </div>
                  <div className="header-actions">
                    <div className="search-wrapper">
                      <Search size={18} className="search-icon-inside" />
                      <input
                        type="text"
                        className="search-input-premium"
                        placeholder="Search discounts by code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      className={`action-btn-premium ${showDiscountForm ? 'cancel-btn' : 'approve-btn'}`}
                      onClick={() => setShowDiscountForm(!showDiscountForm)}
                    >
                      {showDiscountForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Create Discount</>}
                    </button>
                  </div>
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
                        className="action-btn-premium approve-btn"
                        disabled={processingId === 'creating-discount'}
                      >
                        {processingId === 'creating-discount' ? 'Creating...' : <><Plus size={18} /> Create Discount</>}
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
                        {discounts.filter(d => 
                          d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.description?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(discount => (
                          <tr key={discount._id}>
                            <td className="discount-code-cell">
                              <div className="code-badge">{discount.code}</div>
                            </td>
                            <td className="discount-desc-cell">{discount.description}</td>
                            <td>
                              <span className={`type-pill ${discount.discountType}`}>
                                {discount.discountType === 'percentage' ? '%' : '$'}
                              </span>
                            </td>
                            <td className="value-cell">
                              <strong>{discount.discountType === 'percentage' ? `${discount.discountValue}%` : `$${discount.discountValue}`}</strong>
                            </td>
                            <td><span className="min-amount-badge">${discount.minBookingAmount || 0}+</span></td>
                            <td>
                              <div className="usage-progress">
                                <div className="usage-stats">{discount.usageCount}{discount.usageLimit ? `/${discount.usageLimit}` : '/∞'}</div>
                                {discount.usageLimit && (
                                  <div className="progress-bar-small">
                                    <div 
                                      className="progress-fill-small" 
                                      style={{ width: `${Math.min((discount.usageCount / discount.usageLimit) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="date-cell">
                              <div className="date-info">
                                <Calendar size={14} />
                                {new Date(discount.endDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge-premium ${discount.isActive ? 'active' : 'blocked'}`}>
                                {discount.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="actions-cell">
                              <div className="compact-actions">
                                <button
                                  className={`icon-action-btn ${discount.isActive ? 'disable' : 'enable'}`}
                                  onClick={() => handleToggleDiscount(discount._id)}
                                  disabled={processingId === discount._id}
                                  title={discount.isActive ? 'Disable Discount' : 'Enable Discount'}
                                >
                                  {processingId === discount._id ? '...' : (discount.isActive ? <Clock size={18} /> : <CheckCircle size={18} />)}
                                </button>
                                <button
                                  className="icon-action-btn delete"
                                  onClick={() => handleDeleteDiscount(discount._id)}
                                  disabled={processingId === discount._id}
                                  title="Delete Discount"
                                >
                                  {processingId === discount._id ? '...' : <Trash2 size={18} />}
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
          </main>
        </div>
      </div>


      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reject Discount</h2>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for rejecting this discount request:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
              />
            </div>
            <div className="modal-actions">
              <button
                className="action-btn delete-btn"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingDiscountId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="action-btn reject-btn"
                onClick={handleRejectDiscountRequest}
                disabled={processingId === rejectingDiscountId}
              >
                {processingId === rejectingDiscountId ? 'Processing...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
