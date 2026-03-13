import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  Plus, MapPin, Trash2, Edit3, LayoutDashboard, Hotel as HotelIcon, 
  Bed, Calendar, TrendingUp, X, Camera, CheckCircle, Briefcase, Clock,
  ArrowRight
} from 'lucide-react';
import { showToast, showAlert } from '../../utils/swal';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [personalBookings, setPersonalBookings] = useState([]);
  const [cancelingId, setCancelingId] = useState(null);
  const navigate = useNavigate();

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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'hotels', label: 'My Hotels', icon: HotelIcon },
    { id: 'rooms', label: 'My Rooms', icon: Bed },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'my-personal-bookings', label: 'Personal', icon: Briefcase },
  ];

  if (loading) {
    return (
      <div className="owner-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header-premium">
          <div className="header-content">
            <h1>Owner Space</h1>
            <p>Welcome, {user?.name}. Manage your business ecosystem.</p>
          </div>
        </header>

        <div className="dashboard-layout-premium">
          <Sidebar items={sidebarItems} basePath="/owner-dashboard" />

          <main className="dashboard-main-premium">
            {error && <div className="error-banner-premium">{error}</div>}
            <Outlet context={{
              hotels, setHotels,
              rooms, setRooms,
              bookings, setBookings,
              personalBookings, setPersonalBookings,
              loading, error,
              showHotelForm, setShowHotelForm,
              showRoomForm, setShowRoomForm,
              editingHotel, setEditingHotel,
              editingRoom, setEditingRoom,
              processingId, setProcessingId,
              searchTerm, setSearchTerm,
              formData, setFormData,
              roomFormData, setRoomFormData,
              photoFileNames, setPhotoFileNames,
              roomImageFileName, setRoomImageFileName,
              cancelingId, setCancelingId,
              fetchData,
              handleAddHotel,
              handleEditHotel,
              handleSaveHotel,
              handleDeleteHotel,
              handleAddRoom,
              handleEditRoom,
              handleSaveRoom,
              handleDeleteRoom,
              handleToggleRoomAvailability,
              handleCancelReceivedBooking,
              handleCancelPersonalBooking,
              getBookingDisplayStatus,
              getStatusColor,
              getStats,
              getRoomRevenue,
              getRoomBookings,
              getMonthlyRevenueData,
              getOccupancyData,
              getPageViewsData,
              COLORS,
              getImageUrl
            }} />
          </main>
        </div>
      </div>
    </div>
  );
}
