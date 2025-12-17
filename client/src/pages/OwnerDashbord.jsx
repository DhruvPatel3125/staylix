import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import api from '../services/api';
import './OwnerDashbord.css';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [roomRequests, setRoomRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showRoomRequestForm, setShowRoomRequestForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    description: '',
    amenities: '',
    photos: []
  });
  const [roomFormData, setRoomFormData] = useState({
    hotelId: '',
    title: '',
    roomType: 'single',
    pricePerNight: '',
    totalRooms: '',
    availableRooms: '',
    amenities: ''
  });
  const [roomRequestData, setRoomRequestData] = useState({
    hotelId: '',
    roomType: 'single',
    pricePerNight: '',
    totalRooms: '',
    availableRooms: '',
    amenities: '',
    description: ''
  });
  const [photoFileNames, setPhotoFileNames] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hotelsRes, roomsRes, bookingsRes, requestsRes] = await Promise.all([
        api.hotels.getOwnerHotels(), // Changed from getAll() to getOwnerHotels()
        api.rooms.getOwnerRooms(),
        api.bookings.getOwnerBookings(),
        api.rooms.getOwnerRequests()
      ]);

      if (hotelsRes.success) {
        setHotels(hotelsRes.hotels || []);
      }
      if (roomsRes.success) {
        setRooms(roomsRes.rooms || []);
      }
      if (bookingsRes.success) {
        setBookings(bookingsRes.bookings || []);
      }
      if (requestsRes.success) {
        setRoomRequests(requestsRes.requests || []);
      }
    } catch (_err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHotel = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      description: '',
      amenities: '',
      photos: []
    });
    setPhotoFileNames([]);
    setShowHotelForm(true);
  };

  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      city: hotel.address?.city || '',
      state: hotel.address?.state || '',
      country: hotel.address?.country || '',
      pincode: hotel.address?.pincode || '',
      description: hotel.description,
      amenities: hotel.amenities?.join(', ') || '',
      photos: []
    });
    setPhotoFileNames([]);
    setShowHotelForm(true);
  };

  const handleSaveHotel = async () => {
    if (!formData.name || !formData.city || !formData.state || !formData.country) {
      setError('Please fill in all required fields (Name, City, State, Country)');
      return;
    }

    try {
      setProcessingId(editingHotel?._id || 'new');
      setError(null);
      
      const amenitiesArray = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a);

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('country', formData.country);
      submitData.append('pincode', formData.pincode);
      submitData.append('description', formData.description);
      submitData.append('amenities', JSON.stringify(amenitiesArray));

      if (formData.photos && formData.photos.length > 0) {
        for (let i = 0; i < formData.photos.length; i++) {
          submitData.append('photos', formData.photos[i]);
        }
      }

      if (editingHotel && formData.photos.length === 0) {
        submitData.append('keepExistingPhotos', 'true');
      }

      let response;
      if (editingHotel) {
        response = await api.hotels.update(editingHotel._id, submitData);
        if (response.success) {
          setHotels(hotels.map(h => h._id === editingHotel._id ? response.hotel : h));
        }
      } else {
        response = await api.hotels.create(submitData);
        if (response.success) {
          setHotels([...hotels, response.hotel]);
        }
      }

      if (response.success) {
        setShowHotelForm(false);
        setError(null);
      } else {
        setError(response.message || 'Failed to save hotel');
      }
    } catch (err) {
      console.error('Hotel save error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save hotel');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;

    try {
      setProcessingId(hotelId);
      const response = await api.hotels.delete(hotelId);
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

  const handleAddRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      hotelId: '',
      title: '',
      roomType: 'single',
      pricePerNight: '',
      totalRooms: '',
      availableRooms: '',
      amenities: ''
    });
    setShowRoomForm(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      hotelId: room.hotelId?._id || room.hotelId,
      title: room.title,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      totalRooms: room.totalRooms,
      availableRooms: room.availableRooms,
      amenities: room.amenities?.join(', ') || ''
    });
    setShowRoomForm(true);
  };

  const handleSaveRoom = async () => {
    if (!roomFormData.hotelId || !roomFormData.title || !roomFormData.pricePerNight || !roomFormData.totalRooms || roomFormData.availableRooms === '') {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setProcessingId(editingRoom?._id || 'new-room');
      
      const amenitiesArray = roomFormData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a);

      const submitData = {
        hotelId: roomFormData.hotelId,
        title: roomFormData.title,
        roomType: roomFormData.roomType,
        pricePerNight: roomFormData.pricePerNight,
        totalRooms: roomFormData.totalRooms,
        availableRooms: roomFormData.availableRooms,
        amenities: amenitiesArray
      };

      let response;
      if (editingRoom) {
        response = await api.rooms.update(editingRoom._id, submitData);
        if (response.success) {
          setRooms(rooms.map(r => r._id === editingRoom._id ? response.room : r));
        }
      } else {
        response = await api.rooms.create(submitData);
        if (response.success) {
          setRooms([...rooms, response.room]);
        }
      }

      if (response.success) {
        setShowRoomForm(false);
        setError(null);
      } else {
        setError(response.message || 'Failed to save room');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      setProcessingId(roomId);
      const response = await api.rooms.delete(roomId);
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

  const handleToggleRoomAvailability = async (roomId) => {
    try {
      setProcessingId(roomId);
      const response = await api.rooms.toggleAvailability(roomId);
      if (response.success) {
        setRooms(rooms.map(r => r._id === roomId ? { ...r, isAvailable: !r.isAvailable } : r));
      } else {
        setError(response.message || 'Failed to toggle room availability');
      }
    } catch (_err) {
      setError('Failed to toggle room availability');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateRoomRequest = async () => {
    if (!roomRequestData.hotelId || !roomRequestData.pricePerNight || !roomRequestData.totalRooms || roomRequestData.availableRooms === '') {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setProcessingId('creating-room-request');
      
      const amenitiesArray = roomRequestData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a);

      const submitData = {
        ...roomRequestData,
        amenities: amenitiesArray
      };

      const response = await api.rooms.createRequest(submitData);
      if (response.success) {
        setRoomRequests([...roomRequests, response.roomRequest]);
        setRoomRequestData({
          hotelId: '',
          roomType: 'single',
          pricePerNight: '',
          totalRooms: '',
          availableRooms: '',
          amenities: '',
          description: ''
        });
        setShowRoomRequestForm(false);
      } else {
        setError(response.message || 'Failed to create room request');
      }
    } catch (_err) {
      setError('Failed to create room request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStats = () => {
    return {
      totalHotels: hotels.length,
      totalRooms: rooms.length,
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    };
  };

  const getRoomRevenue = (roomId) => {
    return bookings
      .filter(b => b.roomId?._id === roomId || b.roomId === roomId)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  };

  const getRoomBookings = (roomId) => {
    return bookings.filter(b => b.roomId?._id === roomId || b.roomId === roomId);
  };

  const stats = getStats();
  const filteredRooms = rooms.filter(room =>
    room.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const pendingRequests = roomRequests.filter(r => r.status === 'pending');

  if (loading) {
    return <div className="owner-dashboard"><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="owner-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Owner Dashboard</h1>
          <p>Welcome, {user?.name}! Manage your hotels, rooms and bookings.</p>
        </div>

        <div className="dashboard-content">
          <aside className="dashboard-sidebar">
            <div className="profile-card">
              <div className="profile-avatar owner-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'O'}
              </div>
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
                <span className="role-badge owner-badge">Owner</span>
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
                className={`nav-item ${activeTab === 'hotels' ? 'active' : ''}`}
                onClick={() => setActiveTab('hotels')}
              >
                🏨 My Hotels
              </button>
              <button
                className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                🛏️ My Rooms
              </button>
              <button
                className={`nav-item ${activeTab === 'room-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('room-requests')}
              >
                📝 Room Requests
              </button>
              <button
                className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                📅 Bookings
              </button>
              <button
                className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
                onClick={() => setActiveTab('revenue')}
              >
                💰 Revenue Report
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
                      🏨
                    </div>
                    <div className="stat-content">
                      <h3>Total Hotels</h3>
                      <p className="stat-value">{stats.totalHotels}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#48bb78' }}>
                      🛏️
                    </div>
                    <div className="stat-content">
                      <h3>Total Rooms</h3>
                      <p className="stat-value">{stats.totalRooms}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#f6ad55' }}>
                      📅
                    </div>
                    <div className="stat-content">
                      <h3>Total Bookings</h3>
                      <p className="stat-value">{stats.totalBookings}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#38b6ff' }}>
                      💰
                    </div>
                    <div className="stat-content">
                      <h3>Total Revenue</h3>
                      <p className="stat-value">₹{stats.totalRevenue.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="hotels-section">
                <div className="section-header">
                  <h2>My Hotels</h2>
                  <button className="add-btn" onClick={handleAddHotel}>
                    ➕ Add New Hotel
                  </button>
                </div>

                {showHotelForm && (
                  <div className="hotel-form-container">
                    <h3>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h3>
                    <div className="form-group">
                      <label>Hotel Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter hotel name"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="Enter state"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Country *</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="Enter country"
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="Enter pincode"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter hotel description"
                        rows="4"
                      />
                    </div>

                    <div className="form-group">
                      <label>Hotel Photos (up to 5 images)</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          setFormData({ ...formData, photos: e.target.files });
                          setPhotoFileNames(Array.from(e.target.files).map(f => f.name));
                        }}
                      />
                      {photoFileNames.length > 0 && (
                        <div className="file-names">
                          {photoFileNames.map((name, idx) => (
                            <span key={idx} className="file-name">{name}</span>
                          ))}
                        </div>
                      )}
                      {editingHotel?.photos?.length > 0 && formData.photos.length === 0 && (
                        <div className="existing-photos">
                          <p className="label">Current photos:</p>
                          <div className="photos-preview">
                            {editingHotel.photos.map((photo, idx) => (
                              <img key={idx} src={`http://localhost:5000${photo}`} alt={`Hotel ${idx}`} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Amenities (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.amenities}
                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                        placeholder="WiFi, Parking, Pool, Gym, etc."
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        className="save-btn"
                        onClick={handleSaveHotel}
                        disabled={processingId}
                      >
                        {processingId ? 'Saving...' : 'Save Hotel'}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setShowHotelForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {hotels.length === 0 ? (
                  <div className="empty-state">
                    <p>No hotels yet</p>
                    <p className="empty-text">Create your first hotel to get started</p>
                  </div>
                ) : (
                  <div className="hotels-list">
                    {hotels.map(hotel => (
                      <div key={hotel._id} className="hotel-card">
                        {hotel.photos && hotel.photos.length > 0 && (
                          <div className="hotel-image">
                            <img src={`http://localhost:5000${hotel.photos[0]}`} alt={hotel.name} />
                          </div>
                        )}
                        <div className="hotel-info">
                          <h3>{hotel.name}</h3>
                          <p className="location">
                            📍 {hotel.address?.city}, {hotel.address?.state}, {hotel.address?.country}
                          </p>
                          {hotel.description && (
                            <p className="description">{hotel.description}</p>
                          )}
                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="amenities">
                              {hotel.amenities.map((amenity, idx) => (
                                <span key={idx} className="amenity-badge">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                          {hotel.photos && hotel.photos.length > 0 && (
                            <div className="photo-count">
                              📷 {hotel.photos.length} photo(s)
                            </div>
                          )}
                          <div className="hotel-stats">
                            <span>🛏️ {rooms.filter(r => r.hotelId?._id === hotel._id).length} rooms</span>
                          </div>
                        </div>
                        <div className="hotel-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditHotel(hotel)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteHotel(hotel._id)}
                            disabled={processingId === hotel._id}
                          >
                            {processingId === hotel._id ? '...' : '🗑️ Delete'}
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
                <div className="section-header">
                  <h2>My Rooms</h2>
                  <button className="add-btn" onClick={handleAddRoom}>
                    ➕ Add New Room
                  </button>
                </div>

                {showRoomForm && (
                  <div className="room-form-container">
                    <h3>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Hotel *</label>
                        <select
                          value={roomFormData.hotelId}
                          onChange={(e) => setRoomFormData({ ...roomFormData, hotelId: e.target.value })}
                        >
                          <option value="">Select Hotel</option>
                          {hotels.map(h => (
                            <option key={h._id} value={h._id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Room Title *</label>
                        <input
                          type="text"
                          value={roomFormData.title}
                          onChange={(e) => setRoomFormData({ ...roomFormData, title: e.target.value })}
                          placeholder="e.g., Deluxe Room 101"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Room Type *</label>
                        <select
                          value={roomFormData.roomType}
                          onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="deluxe">Deluxe</option>
                          <option value="suite">Suite</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Price Per Night ($) *</label>
                        <input
                          type="number"
                          value={roomFormData.pricePerNight}
                          onChange={(e) => setRoomFormData({ ...roomFormData, pricePerNight: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Total Rooms *</label>
                        <input
                          type="number"
                          value={roomFormData.totalRooms}
                          onChange={(e) => setRoomFormData({ ...roomFormData, totalRooms: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                      <div className="form-group">
                        <label>Available Rooms *</label>
                        <input
                          type="number"
                          value={roomFormData.availableRooms}
                          onChange={(e) => setRoomFormData({ ...roomFormData, availableRooms: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Amenities (comma-separated)</label>
                      <input
                        type="text"
                        value={roomFormData.amenities}
                        onChange={(e) => setRoomFormData({ ...roomFormData, amenities: e.target.value })}
                        placeholder="WiFi, AC, TV, Bathroom, etc."
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        className="save-btn"
                        onClick={handleSaveRoom}
                        disabled={processingId}
                      >
                        {processingId ? 'Saving...' : 'Save Room'}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setShowRoomForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="rooms-search">
                  <input
                    type="text"
                    placeholder="Search rooms by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                {filteredRooms.length === 0 ? (
                  <div className="empty-state">
                    <p>{searchTerm ? 'No rooms found' : 'No rooms yet'}</p>
                    <p className="empty-text">Add your first room to get started</p>
                  </div>
                ) : (
                  <div className="rooms-grid">
                    {filteredRooms.map(room => (
                      <div key={room._id} className="room-card">
                        <div className="room-header">
                          <h3>{room.title}</h3>
                          <span className={`availability-badge ${room.isAvailable ? 'available' : 'unavailable'}`}>
                            {room.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <div className="room-info">
                          <p><strong>Hotel:</strong> {room.hotelId?.name}</p>
                          <p><strong>Type:</strong> {room.roomType}</p>
                          <p><strong>Price:</strong> ${room.pricePerNight}/night</p>
                          <p><strong>Availability:</strong> {room.availableRooms}/{room.totalRooms}</p>
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="room-amenities">
                              {room.amenities.map((amenity, idx) => (
                                <span key={idx} className="amenity-tag">{amenity}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="room-actions">
                          <button
                            className={`action-btn ${room.isAvailable ? 'block-btn' : 'unblock-btn'}`}
                            onClick={() => handleToggleRoomAvailability(room._id)}
                            disabled={processingId === room._id}
                          >
                            {processingId === room._id ? '...' : room.isAvailable ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditRoom(room)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteRoom(room._id)}
                            disabled={processingId === room._id}
                          >
                            {processingId === room._id ? '...' : '🗑️'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'room-requests' && (
              <div className="requests-section">
                <div className="section-header">
                  <h2>Room Requests</h2>
                  <button className="add-btn" onClick={() => setShowRoomRequestForm(!showRoomRequestForm)}>
                    {showRoomRequestForm ? '✕ Cancel' : '➕ Request Room'}
                  </button>
                </div>

                {showRoomRequestForm && (
                  <div className="request-form-container">
                    <h3>Request New Room (Needs Admin Approval)</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Hotel *</label>
                        <select
                          value={roomRequestData.hotelId}
                          onChange={(e) => setRoomRequestData({ ...roomRequestData, hotelId: e.target.value })}
                        >
                          <option value="">Select Hotel</option>
                          {hotels.map(h => (
                            <option key={h._id} value={h._id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Room Type *</label>
                        <select
                          value={roomRequestData.roomType}
                          onChange={(e) => setRoomRequestData({ ...roomRequestData, roomType: e.target.value })}
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="deluxe">Deluxe</option>
                          <option value="suite">Suite</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Price Per Night ($) *</label>
                        <input
                          type="number"
                          value={roomRequestData.pricePerNight}
                          onChange={(e) => setRoomRequestData({ ...roomRequestData, pricePerNight: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                      <div className="form-group">
                        <label>Total Rooms *</label>
                        <input
                          type="number"
                          value={roomRequestData.totalRooms}
                          onChange={(e) => setRoomRequestData({ ...roomRequestData, totalRooms: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Available Rooms *</label>
                        <input
                          type="number"
                          value={roomRequestData.availableRooms}
                          onChange={(e) => setRoomRequestData({ ...roomRequestData, availableRooms: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Amenities (comma-separated)</label>
                      <input
                        type="text"
                        value={roomRequestData.amenities}
                        onChange={(e) => setRoomRequestData({ ...roomRequestData, amenities: e.target.value })}
                        placeholder="WiFi, AC, TV, etc."
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={roomRequestData.description}
                        onChange={(e) => setRoomRequestData({ ...roomRequestData, description: e.target.value })}
                        placeholder="Additional details about the room"
                        rows="3"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        className="save-btn"
                        onClick={handleCreateRoomRequest}
                        disabled={processingId}
                      >
                        {processingId ? 'Submitting...' : 'Submit Request'}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setShowRoomRequestForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {pendingRequests.length > 0 && (
                  <div className="pending-requests">
                    <h3>Pending Requests</h3>
                    <div className="requests-grid">
                      {pendingRequests.map(req => (
                        <div key={req._id} className="request-card pending">
                          <div className="request-status">
                            <span className="status-badge pending">Pending</span>
                          </div>
                          <div className="request-info">
                            <p><strong>Hotel:</strong> {req.hotelId?.name}</p>
                            <p><strong>Room Type:</strong> {req.roomType}</p>
                            <p><strong>Price:</strong> ${req.pricePerNight}/night</p>
                            <p><strong>Rooms:</strong> {req.availableRooms}/{req.totalRooms}</p>
                            <p className="date">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {roomRequests.filter(r => r.status !== 'pending').length > 0 && (
                  <div className="approved-requests">
                    <h3>Request History</h3>
                    <div className="requests-table-wrapper">
                      <table className="requests-table">
                        <thead>
                          <tr>
                            <th>Hotel</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Rooms</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomRequests.filter(r => r.status !== 'pending').map(req => (
                            <tr key={req._id} className={`status-${req.status}`}>
                              <td>{req.hotelId?.name}</td>
                              <td>{req.roomType}</td>
                              <td>${req.pricePerNight}</td>
                              <td>{req.availableRooms}/{req.totalRooms}</td>
                              <td>
                                <span className={`status-badge ${req.status}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {roomRequests.length === 0 && (
                  <div className="empty-state">
                    <p>No room requests yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bookings-section">
                <h2>Bookings for My Rooms</h2>

                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <p>No bookings yet</p>
                    <p className="empty-text">Your room bookings will appear here</p>
                  </div>
                ) : (
                  <div className="bookings-list">
                    {bookings.map(booking => (
                      <div key={booking._id} className="booking-card">
                        <div className="booking-header">
                          <div>
                            <h3>{booking.hotelId?.name || 'Hotel'}</h3>
                            <p className="booking-room">
                              🛏️ {booking.roomId?.title || 'Room'}
                            </p>
                          </div>
                          <div className="booking-status">
                            <span className="status-badge">
                              {new Date(booking.checkOut) < new Date() ? 'Completed' : 'Active'}
                            </span>
                          </div>
                        </div>

                        <div className="booking-details">
                          <div className="detail-item">
                            <span className="label">Guest</span>
                            <span className="value">{booking.userId?.name || 'Guest'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Email</span>
                            <span className="value">{booking.userId?.email || 'N/A'}</span>
                          </div>
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
                            <span className="label">Guests</span>
                            <span className="value">{booking.guests}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Total Amount</span>
                            <span className="value price">₹{booking.totalAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="revenue-section">
                <h2>Revenue Report</h2>
                
                <div className="revenue-summary">
                  <div className="revenue-card">
                    <h3>Total Revenue</h3>
                    <p className="revenue-amount">₹{stats.totalRevenue.toFixed(2)}</p>
                    <p className="revenue-info">From {bookings.length} bookings</p>
                  </div>
                  <div className="revenue-card">
                    <h3>Average Per Room</h3>
                    <p className="revenue-amount">₹{rooms.length > 0 ? (stats.totalRevenue / rooms.length).toFixed(2) : 0}</p>
                    <p className="revenue-info">Across {rooms.length} rooms</p>
                  </div>
                  <div className="revenue-card">
                    <h3>Active Bookings</h3>
                    <p className="revenue-amount">{bookings.filter(b => new Date(b.checkOut) >= new Date()).length}</p>
                    <p className="revenue-info">Ongoing bookings</p>
                  </div>
                </div>

                {rooms.length === 0 ? (
                  <div className="empty-state">
                    <p>No rooms to report</p>
                  </div>
                ) : (
                  <div className="rooms-revenue-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Room Title</th>
                          <th>Type</th>
                          <th>Price/Night</th>
                          <th>Bookings</th>
                          <th>Revenue</th>
                          <th>Avg Per Booking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map(room => {
                          const roomBookings = getRoomBookings(room._id);
                          const roomRevenue = getRoomRevenue(room._id);
                          const avgPerBooking = roomBookings.length > 0 ? roomRevenue / roomBookings.length : 0;
                          
                          return (
                            <tr key={room._id}>
                              <td><strong>{room.title}</strong></td>
                              <td>{room.roomType}</td>
                              <td>${room.pricePerNight}</td>
                              <td>{roomBookings.length}</td>
                              <td className="revenue">₹{roomRevenue.toFixed(2)}</td>
                              <td className="revenue">₹{avgPerBooking.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
