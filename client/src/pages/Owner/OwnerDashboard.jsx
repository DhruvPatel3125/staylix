import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import useAuth from '../../hooks/useAuth';
import { 
  Plus, 
  MapPin, 
  Trash2, 
  Edit3, 
  LayoutDashboard, 
  Hotel as HotelIcon, 
  Bed, 
  Calendar, 
  TrendingUp,
  X,
  Camera,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { showToast, showAlert } from '../../utils/swal';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [personalBookings, setPersonalBookings] = useState([]);
  const [cancelingId, setCancelingId] = useState(null);
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);

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
    photos: [],
    coordinates: [0.0, 0.0]
  });
  const [roomFormData, setRoomFormData] = useState({
    hotelId: '',
    title: '',
    roomType: 'single',
    pricePerNight: '',
    totalRooms: '',
    availableRooms: '',
    guestCapacity: '',
    amenities: '',
    image: null
  });
  const [photoFileNames, setPhotoFileNames] = useState([]);
  const [roomImageFileName, setRoomImageFileName] = useState('');

  useEffect(() => {
    fetchData();
    
    // Check for tab in URL
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'my-bookings') {
      setActiveTab('my-bookings');
    }
  }, [location.search]);
  
  // Automatic Geocoding Effect
  useEffect(() => {
    if (!showHotelForm) return;
    
    const { city, state, country } = formData;
    if (!city && !state && !country) return;

    const fetchCoords = async () => {
      try {
        const params = new URLSearchParams({
          format: 'json',
          limit: '1',
          city: city || '',
          state: state || '',
          country: country || '',
        });

        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Staylix-Travel-App/1.0 (contact@staylix.com)'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const lon = parseFloat(data[0].lon);
            const lat = parseFloat(data[0].lat);
            if (!isNaN(lon) && !isNaN(lat)) {
              setFormData(prev => ({
                ...prev,
                coordinates: [lon, lat]
              }));
            }
          }
        }
      } catch (err) {
        console.error('Frontend geocoding error:', err);
      }
    };

    const timer = setTimeout(fetchCoords, 1000);
    return () => clearTimeout(timer);
  }, [formData.city, formData.state, formData.country, showHotelForm]);
  const handleCancelReceivedBooking = async (bookingId) => {
    const confirmed = await showAlert.confirm(
      'Cancel & Refund?',
      'Are you sure you want to cancel this booking? A full refund will be initiated to the guest.'
    );

    if (!confirmed) return;

    try {
      setCancelingId(bookingId);
      const response = await api.bookings.cancel(bookingId);
      if (response.success) {
        setBookings(prev => prev.map(b => 
          b._id === bookingId ? { ...b, bookingStatus: 'cancelled', refundStatus: 'processed' } : b
        ));
        showToast.success('Booking cancelled and refund initiated');
      } else {
        showAlert.error('Error', response.message || 'Failed to cancel booking');
      }
    } catch {
      showAlert.error('Error', 'Failed to cancel booking');
    } finally {
      setCancelingId(null);
    }
  };

  const handleCancelPersonalBooking = async (bookingId) => {
    const confirmed = await showAlert.confirm(
      'Are you sure?',
      'Do you really want to cancel this booking? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setCancelingId(bookingId);
      const response = await api.bookings.cancel(bookingId);
      if (response.success) {
        setPersonalBookings(prev => prev.map(b => 
          b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b
        ));
        showToast.success('Booking cancelled successfully');
      } else {
        showAlert.error('Error', response.message || 'Failed to cancel booking');
      }
    } catch {
      showAlert.error('Error', 'Failed to cancel booking');
    } finally {
      setCancelingId(null);
    }
  };

  const getBookingDisplayStatus = (booking) => {
    if (booking.bookingStatus === 'cancelled') return 'Cancelled';
    const checkOut = new Date(booking.checkOut);
    if (isNaN(checkOut.getTime())) return 'Active';
    return checkOut < new Date() ? 'Completed' : 'Active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#667eea';
      case 'Completed': return '#48bb78';
      case 'Cancelled': return '#f56565';
      default: return '#666';
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hotelsRes, roomsRes, bookingsRes, personalRes] = await Promise.all([
        api.hotels.getOwnerHotels(),
        api.rooms.getOwnerRooms(),
        api.bookings.getOwnerBookings(),
        api.bookings.getMyBookings()
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
      if (personalRes.success) {
        setPersonalBookings(personalRes.bookings || []);
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
      photos: [],
      coordinates: [0.0, 0.0]
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
      photos: [],
      coordinates: hotel.location?.coordinates || [0.0, 0.0]
    });
    setPhotoFileNames([]);
    setShowHotelForm(true);
  };

  const handleSaveHotel = async () => {
    if (!formData.name || !formData.city || !formData.state || !formData.country) {
      showToast.error('Please fill in all required fields (Name, City, State, Country)');
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
      submitData.append('coordinates', JSON.stringify(formData.coordinates));

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
          showToast.success('Hotel updated successfully');
        }
      } else {
        response = await api.hotels.create(submitData);
        if (response.success) {
          setHotels([...hotels, response.hotel]);
          showToast.success('Hotel created successfully');
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
      guestCapacity: '',
      amenities: '',
      image: null
    });
    setRoomImageFileName('');
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
      guestCapacity: room.guestCapacity || '',
      amenities: room.amenities?.join(', ') || '',
      image: null
    });
    setRoomImageFileName('');
    setShowRoomForm(true);
  };

  const handleSaveRoom = async () => {
    if (!roomFormData.hotelId || !roomFormData.title || !roomFormData.pricePerNight || !roomFormData.totalRooms || roomFormData.availableRooms === '' || !roomFormData.guestCapacity) {
      showToast.error('Please fill in all required fields');
      return;
    }

    try {
      setProcessingId(editingRoom?._id || 'new-room');
      
      const amenitiesArray = roomFormData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a);

      const submitData = new FormData();
      submitData.append('hotelId', roomFormData.hotelId);
      submitData.append('title', roomFormData.title);
      submitData.append('roomType', roomFormData.roomType);
      submitData.append('pricePerNight', roomFormData.pricePerNight);
      submitData.append('totalRooms', roomFormData.totalRooms);
      submitData.append('availableRooms', roomFormData.availableRooms);
      submitData.append('guestCapacity', roomFormData.guestCapacity);
      submitData.append('amenities', JSON.stringify(amenitiesArray));

      if (roomFormData.image && roomFormData.image instanceof File) {
        submitData.append('image', roomFormData.image);
      }

      let response;
      if (editingRoom) {
        response = await api.rooms.update(editingRoom._id, submitData);
        if (response.success) {
          setRooms(rooms.map(r => r._id === editingRoom._id ? response.room : r));
          showToast.success('Room updated successfully');
        }
      } else {
        response = await api.rooms.create(submitData);
        if (response.success) {
          setRooms([...rooms, response.room]);
          showToast.success('Room created successfully');
        }
      }

      if (response.success) {
        setShowRoomForm(false);
        setError(null);
      } else {
        showAlert.error('Error', response.message || 'Failed to save room');
      }
    } catch (err) {
      showAlert.error('Error', err.response?.data?.message || 'Failed to save room');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmed = await showAlert.confirm(
      'Delete Room?',
      'Are you sure you want to delete this room?'
    );

    if (!confirmed) return;

    try {
      setProcessingId(roomId);
      const response = await api.rooms.delete(roomId);
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





  const getStats = () => {
    const activeBookings = bookings.filter(b => b.bookingStatus !== 'cancelled');
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'cancelled');
    
    return {
      totalHotels: hotels.length,
      totalRooms: rooms.length,
      totalBookings: activeBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalRevenue: activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
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

  // Chart Data Preparation
  const getMonthlyRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data = months.map(month => ({ name: month, revenue: 0 }));
    
    bookings.forEach(booking => {
      if (booking.bookingStatus !== 'cancelled' && booking.checkIn) {
        const date = new Date(booking.checkIn);
        if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
          data[date.getMonth()].revenue += (booking.totalAmount || 0);
        }
      }
    });

    return data;
  };

  const getOccupancyData = () => {
    return hotels.map(hotel => {
      const hotelRooms = rooms.filter(r => r.hotelId?._id === hotel._id || r.hotelId === hotel._id);
      const totalRoomsCount = hotelRooms.reduce((sum, r) => sum + (Number(r.totalRooms) || 0), 0);
      const availableRoomsCount = hotelRooms.reduce((sum, r) => sum + (Number(r.availableRooms) || 0), 0);
      const occupiedRooms = totalRoomsCount - availableRoomsCount;
      const occupancyRate = totalRoomsCount > 0 ? (occupiedRooms / totalRoomsCount) * 100 : 0;
      
      return {
        name: hotel.name.length > 15 ? hotel.name.substring(0, 15) + '...' : hotel.name,
        occupancyRate: Math.round(occupancyRate),
        total: totalRoomsCount,
        occupied: occupiedRooms
      };
    }).filter(d => d.total > 0);
  };

  const getPageViewsData = () => {
    return hotels.map(hotel => {
      // Create a pseudo-random number based on hotel ID for consistent mockup views
      const seed = hotel._id ? hotel._id.charCodeAt(0) + hotel._id.charCodeAt(hotel._id.length-1) : 50;
      const baseViews = (seed * 15) % 1500;
      
      return {
        name: hotel.name.length > 15 ? hotel.name.substring(0, 15) + '...' : hotel.name,
        views: baseViews + 100 + (hotel.photos?.length || 0) * 50
      };
    });
  };
  
  const COLORS = ['#667eea', '#48bb78', '#f6ad55', '#e53e3e', '#38b6ff', '#805ad5', '#d53f8c'];

  const stats = getStats();
  const filteredRooms = rooms.filter(room =>
    room.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <TrendingUp size={20} /> Overview
              </button>
              <button
                className={`nav-item ${activeTab === 'hotels' ? 'active' : ''}`}
                onClick={() => setActiveTab('hotels')}
              >
                <HotelIcon size={20} /> My Hotels
              </button>
              <button
                className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                <Bed size={20} /> My Rooms
              </button>
              <button
                className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <Calendar size={20} /> Received Bookings
              </button>
              <button
                className={`nav-item ${activeTab === 'my-bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-bookings')}
              >
                <Calendar size={20} /> My Personal Bookings
              </button>
              <button
                className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
                onClick={() => setActiveTab('revenue')}
              >
                <TrendingUp size={20} /> Analytics & Reports
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
                    <div className="stat-icon" style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
                      <HotelIcon size={28} />
                    </div>
                    <div className="stat-content">
                      <h3>Total Hotels</h3>
                      <p className="stat-value">{stats.totalHotels}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(72, 187, 120, 0.1)', color: '#48bb78' }}>
                      <Bed size={28} />
                    </div>
                    <div className="stat-content">
                      <h3>Total Rooms</h3>
                      <p className="stat-value">{stats.totalRooms}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(246, 173, 85, 0.1)', color: '#f6ad55' }}>
                      <Calendar size={28} />
                    </div>
                    <div className="stat-content">
                      <h3>Total Bookings</h3>
                      <p className="stat-value">{stats.totalBookings}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#e53e3e' }}>
                      <X size={28} />
                    </div>
                    <div className="stat-content">
                      <h3>Cancelled Bookings</h3>
                      <p className="stat-value">{stats.cancelledBookings}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(56, 182, 255, 0.1)', color: '#38b6ff' }}>
                      <Briefcase size={28} />
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
                  <h2><HotelIcon /> My Hotels</h2>
                  <button className="add-btn" onClick={handleAddHotel}>
                    <Plus size={20} /> Add New Hotel
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
                        <label>Coordinates (Automatic)</label>
                        <div className="coordinates-display" style={{ 
                          padding: '0.8rem', 
                          background: '#f8fafc', 
                          borderRadius: '8px', 
                          fontSize: '0.9rem',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{formData.coordinates[0]?.toFixed(4)}, {formData.coordinates[1]?.toFixed(4)}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Auto-fetched</span>
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
                              <img key={idx} src={getImageUrl(photo)} alt={`Hotel ${idx}`} />
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
                            <img src={getImageUrl(hotel.photos[0])} alt={hotel.name} />
                          </div>
                        )}
                        <div className="hotel-info">
                          <h3>{hotel.name}</h3>
                          <p className="location">
                            <MapPin size={16} /> {hotel.address?.city}, {hotel.address?.state}
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
                              <Edit3 size={16} /> Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteHotel(hotel._id)}
                              disabled={processingId === hotel._id}
                            >
                              {processingId === hotel._id ? '...' : <><Trash2 size={16} /> Delete</>}
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
                  <h2><Bed size={24} /> My Rooms</h2>
                  <button className="add-btn" onClick={handleAddRoom}>
                    <Plus size={20} /> Add New Room
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
                        <label>Price Per Night (₹) *</label>
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
                      <div className="form-group">
                        <label>Guest Capacity *</label>
                        <input
                          type="number"
                          value={roomFormData.guestCapacity}
                          onChange={(e) => setRoomFormData({ ...roomFormData, guestCapacity: e.target.value })}
                          placeholder="2"
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

                    <div className="form-group">
                      <label>Room Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setRoomFormData({ ...roomFormData, image: file });
                          setRoomImageFileName(file?.name || '');
                        }}
                      />
                      {roomImageFileName && <p className="file-name">{roomImageFileName}</p>}
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
                        {room.image && (
                          <div className="room-image-container">
                            <img src={getImageUrl(room.image)} alt={room.title} className="room-image" />
                          </div>
                        )}
                        <div className="room-content">
                          <div className="room-header">
                            <h3>{room.title}</h3>
                            <span className={`availability-badge ${room.isAvailable ? 'available' : 'unavailable'}`}>
                              {room.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="room-info">
                            <p><strong>Hotel:</strong> {room.hotelId?.name}</p>
                            <p><strong>Type:</strong> {room.roomType}</p>
                            <p><strong>Price:</strong> ₹{room.pricePerNight}/night</p>
                            <p><strong>Availability:</strong> {room.availableRooms}/{room.totalRooms}</p>
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="room-amenities">
                                {room.amenities.map((amenity, idx) => (
                                  <span key={idx} className="amenity-tag">{amenity}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="room-actions">
                          <button
                            className={`action-btn ${room.isAvailable ? 'block-btn' : 'unblock-btn'}`}
                            onClick={() => handleToggleRoomAvailability(room._id)}
                            disabled={processingId === room._id}
                          >
                            {processingId === room._id ? '...' : (room.isAvailable ? 'Deactivate' : 'Activate')}
                          </button>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditRoom(room)}
                          >
                            <Edit3 size={16} /> Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteRoom(room._id)}
                            disabled={processingId === room._id}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}



            {activeTab === 'bookings' && (
              <div className="bookings-section">
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
                            {booking.refundStatus && booking.refundStatus !== 'none' && (
                              <div className="detail-item">
                                <span className="label">Refund Status</span>
                                <span className="value" style={{ 
                                  color: booking.refundStatus === 'processed' ? '#48bb78' : '#e53e3e',
                                  fontWeight: '700',
                                  textTransform: 'capitalize'
                                }}>
                                  {booking.refundStatus}
                                </span>
                              </div>
                            )}
                          </div>

                          {status === 'Active' && (
                            <button
                              className="cancel-btn"
                              onClick={() => handleCancelReceivedBooking(booking._id)}
                              disabled={cancelingId === booking._id}
                              style={{ 
                                marginTop: '1.5rem',
                                width: '100%',
                                padding: '0.85rem',
                                background: 'white',
                                color: '#f56565',
                                border: '2px solid #fff5f5',
                                borderRadius: '12px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {cancelingId === booking._id ? '...' : <><Trash2 size={16} /> Cancel & Refund</>}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-bookings' && (
              <div className="bookings-section">
                <h2>My Personal Bookings</h2>

                {personalBookings.length === 0 ? (
                  <div className="empty-state">
                    <p>No personal bookings yet</p>
                    <p className="empty-text">Book your next stay and it will appear here</p>
                  </div>
                ) : (
                  <div className="bookings-list">
                    {personalBookings.map((booking) => {
                      const status = getBookingDisplayStatus(booking);

                      return (
                        <div key={booking._id} className="booking-card personal-booking-card">
                          <div className="booking-header">
                            <div>
                              <h3>{booking.hotelId?.name || 'Hotel'}</h3>
                              <p className="booking-location">
                                <MapPin size={16} /> {booking.hotelId?.address?.city || 'Location N/A'}
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
            )}

            {activeTab === 'revenue' && (
              <div className="revenue-section analytics-section">
                <h2>Analytics & Reports</h2>
                
                <div className="revenue-summary" style={{ marginBottom: '2rem' }}>
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

                {/* Charts Area */}
                <div className="charts-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '2rem',
                  marginBottom: '2rem',
                  marginTop: '1.5rem'
                }}>
                  {/* Monthly Revenue Chart */}
                  <div className="chart-container" style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem' }}>Monthly Revenue ({new Date().getFullYear()})</h3>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={getMonthlyRevenueData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} tick={{fill: '#64748b', fontSize: 12}} />
                          <RechartsTooltip formatter={(value) => [`₹${value.toFixed(0)}`, 'Revenue']} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                          <Area type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Occupancy Rate Chart */}
                  <div className="chart-container" style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem' }}>Occupancy Rates (%)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={getOccupancyData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#64748b', fontSize: 12}} />
                          <RechartsTooltip formatter={(value) => [`${value}%`, 'Occupancy']} cursor={{fill: 'rgba(72, 187, 120, 0.1)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                          <Bar dataKey="occupancyRate" fill="#48bb78" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Page Views Chart */}
                  <div className="chart-container" style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    gridColumn: '1 / -1'
                  }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem' }}>Hotel Page Views</h3>
                    <div style={{ width: '100%', height: 350 }}>
                      <ResponsiveContainer>
                        <BarChart data={getPageViewsData()} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0"/>
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fill: '#64748b', fontSize: 12}} />
                          <RechartsTooltip formatter={(value) => [value, 'Views']} cursor={{fill: 'rgba(246, 173, 85, 0.1)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                          <Bar dataKey="views" fill="#f6ad55" radius={[0, 6, 6, 0]} barSize={25}>
                            {getPageViewsData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <h3>Breakdown by Rooms</h3>
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
                              <td>₹{room.pricePerNight}</td>
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
