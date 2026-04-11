import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  Users, 
  Hotel, 
  Bed, 
  Calendar, 
  PieChart, 
  Tag, 
  LayoutDashboard, 
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { showToast, showAlert } from '../../utils/swal';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, usersRes, hotelsRes, roomsRes, requestsRes, discountsRes, bookingsRes, reviewsRes] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getAllUsers(),
        api.admin.getAllHotels(),
        api.admin.getAllRooms(),
        api.admin.getOwnerRequests(),
        api.discounts.getAll(),
        api.admin.getAllBookings(),
        api.reviews.getAll()
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
      if (bookingsRes.success) {
        setBookings(bookingsRes.bookings || []);
      }
      if (reviewsRes.success) {
        setReviews(reviewsRes.reviews || []);
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

  const handleApproveDiscount = async (discountId) => {
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
        showToast.success('Discount approved and activated');
      } else {
        showAlert.error('Error', response.message || 'Failed to approve discount');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to approve discount');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDiscount = async (discountId) => {
    const { value: reason } = await showAlert.input(
      'Reject Discount?',
      'Please provide a reason for rejection:',
      'Inappropriate discount amount'
    );

    if (reason === undefined) return; 

    try {
      setProcessingId(discountId);
      const response = await api.discounts.rejectRequest(discountId, reason);
      if (response.success) {
        setDiscounts(discounts.map(d =>
          d._id === discountId ? { ...d, requestStatus: 'rejected', isActive: false, rejectionReason: reason } : d
        ));
        showToast.success('Discount request rejected');
      } else {
        showAlert.error('Error', response.message || 'Failed to reject discount');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to reject discount');
    } finally {
      setProcessingId(null);
    }
  };

  // --- Chart Data Preparation Helpers ---
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
    const now = new Date();

    const data = hotels.map(hotel => {
      // Use .toString() for reliable ID comparison
      const hotelRooms = rooms.filter(r => 
        (r.hotelId?._id?.toString() || r.hotelId?.toString()) === hotel._id?.toString()
      );
      
      const totalRoomsCount = hotelRooms.reduce((sum, r) => sum + (Number(r.totalRooms) || 0), 0);
      
      // Calculate occupied rooms based on active bookings for today
      const hotelRoomIds = new Set(hotelRooms.map(r => r._id.toString()));
      const activeBookings = bookings.filter(b => {
        if (b.bookingStatus === 'cancelled') return false;
        const bRoomId = b.roomId?._id?.toString() || b.roomId?.toString();
        if (!hotelRoomIds.has(bRoomId)) return false;
        
        const checkOut = new Date(b.checkOut);
        // An active ongoing booking is one that hasn't checked out yet
        return checkOut >= now;
      });

      const occupiedRooms = activeBookings.length;
      const occupancyRate = totalRoomsCount > 0 ? (occupiedRooms / totalRoomsCount) * 100 : 0;
      
      return {
        name: hotel.name.length > 12 ? hotel.name.substring(0, 12) + '...' : hotel.name,
        occupancyRate: Math.round(occupancyRate),
        total: totalRoomsCount,
        occupied: occupiedRooms
      };
    }).filter(d => d.total > 0);

    // Sort by highest occupancy and take top 10 to prevent squishing the chart UI
    return data.sort((a, b) => b.occupancyRate - a.occupancyRate).slice(0, 10);
  };

  const getPageViewsData = () => {
    return hotels.map(hotel => {
      const seed = hotel._id ? hotel._id.charCodeAt(0) + hotel._id.charCodeAt(hotel._id.length-1) : 50;
      const baseViews = (seed * 15) % 1500;
      return {
        name: hotel.name.length > 15 ? hotel.name.substring(0, 15) + '...' : hotel.name,
        views: baseViews + 100 + (hotel.photos?.length || 0) * 50
      };
    });
  };

  const getRoomRevenue = (roomId) => {
    return bookings
      .filter(b => b.roomId?._id === roomId || b.roomId === roomId)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  };

  const getRoomBookings = (roomId) => {
    return bookings.filter(b => b.roomId?._id === roomId || b.roomId === roomId);
  };

  const CHART_COLORS = ['#667eea', '#48bb78', '#f6ad55', '#e53e3e', '#38b6ff', '#805ad5', '#d53f8c'];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'owners', label: 'Owners', icon: Users },
    { id: 'owner-requests', label: 'Owner Requests', icon: UserPlus },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'rooms', label: 'Rooms', icon: Bed },
    { id: 'reports', label: 'Reports', icon: LayoutDashboard },
    { id: 'discounts', label: 'Discounts', icon: Tag },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare }
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
            basePath="/admin-dashboard" 
          />

          <main className="dashboard-main" style={{ animation: 'fadeInScale 0.6s ease-out both' }}>
            {error && <div className="error-banner">{error}</div>}
            
            <Outlet context={{ 
              stats, users, hotels, rooms, bookings, ownerRequests, discounts, reviews,
              searchTerm, setSearchTerm, processingId, setProcessingId,
              setUsers, setHotels, setRooms, setBookings, setOwnerRequests, setDiscounts, setReviews,
              handleBlockUser, handleDeleteUser, handleDeleteHotel, handleDeleteRoom,
              handleApproveOwner, handleRejectOwner,
              handleCreateDiscount, handleToggleDiscount, handleDeleteDiscount,
              handleApproveDiscount, handleRejectDiscount,
              showDiscountForm, setShowDiscountForm, newDiscount, setNewDiscount,
              getMonthlyRevenueData, getOccupancyData, getPageViewsData, 
              getRoomRevenue, getRoomBookings, CHART_COLORS
            }} />
          </main>
        </div>
      </div>
    </div>
  );
}
