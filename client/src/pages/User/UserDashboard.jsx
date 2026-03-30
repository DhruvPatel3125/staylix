import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  Calendar, Hotel, User as UserIcon, MapPin, Clock, 
  Briefcase, Trash2, CheckCircle, AlertCircle, FileText, 
  Plus, X, Heart as HeartIcon, Mail, Shield, LayoutDashboard
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { showToast, showAlert } from '../../utils/swal';
import api, { API_BASE_URL } from '../../services/api';
import { fetchWishlist, toggleWishlist, toggleWishlistLocal } from '../../store/slices/wishlistSlice';
import { getImageUrl } from '../../utils/imageUrl';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import './UserDashboard.css';

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';

  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

export default function UserDashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { wishlistedHotels, loading: wishlistLoading } = useSelector((state) => state.wishlist);
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
    dispatch(fetchWishlist());
  }, [dispatch]);

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
      showToast.error('Please fill in all required fields');
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
        showAlert.success('Success', 'Your owner request has been submitted successfully!');
      } else {
        showAlert.error('Error', response.message || 'Failed to submit request');
      }
    } catch (err) {
      showAlert.error('Error', err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = await showAlert.confirm(
      'Are you sure?',
      'Do you really want to cancel this booking? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setCancelingId(bookingId);
      const response = await api.bookings.cancel(bookingId);
      if (response.success) {
        setBookings(prev => prev.map(b => 
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

  const sidebarItems = [
    // { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    ...(user?.role === 'user' ? [{ id: 'become-owner', label: 'Become Owner', icon: Briefcase }] : []),
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'wishlist', label: 'Wishlist', icon: HeartIcon },
  ];

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
        <header className="dashboard-header-premium">
          <div className="header-content">
            <h1>Guest Dashboard</h1>
            <p>Welcome back, {user?.name || 'User'}! Your travel journey at a glance.</p>
          </div>
        </header>

        <div className="dashboard-layout-premium">
          <Sidebar items={sidebarItems} basePath="/user-dashboard" />

          <main className="dashboard-main-premium">
            {error && <div className="error-banner-premium">{error}</div>}
            
            <Outlet context={{
              user,
              bookings,
              wishlistedHotels,
              wishlistLoading,
              ownerRequest,
              showOwnerRequestForm,
              setShowOwnerRequestForm,
              submittingRequest,
              ownerRequestData,
              setOwnerRequestData,
              cancelingId,
              dispatch,
              fetchData,
              handleSubmitOwnerRequest,
              handleCancelBooking,
              toggleWishlist,
              toggleWishlistLocal,
              getBookingStatus,
              getStatusColor,
              formatDate,
              getImageUrl,
              API_BASE_URL
            }} />
          </main>
        </div>
      </div>
    </div>
  );
}
