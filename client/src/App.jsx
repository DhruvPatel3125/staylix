import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import { fetchWishlist, clearWishlist } from './store/slices/wishlistSlice';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import HotelDetails from './pages/Hotel/HotelDetails';
import UserDashboard from './pages/User/UserDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import OwnerDashboard from './pages/Owner/OwnerDashboard';
import AboutUs from './pages/Static/AboutUs';
import ContactUs from './pages/Static/ContactUs';

// Admin Tab Components
import AdminOverviewTab from './pages/Admin/tabs/OverviewTab';
import AdminUsersTab from './pages/Admin/tabs/UsersTab';
import AdminOwnerRequestsTab from './pages/Admin/tabs/OwnerRequestsTab';
import AdminHotelsTab from './pages/Admin/tabs/HotelsTab';
import AdminRoomsTab from './pages/Admin/tabs/RoomsTab';
import AdminReportsTab from './pages/Admin/tabs/ReportsTab';
import AdminDiscountsTab from './pages/Admin/tabs/DiscountsTab';

// Owner Tab Components
import OwnerOverviewTab from './pages/Owner/tabs/OverviewTab';
import OwnerHotelsTab from './pages/Owner/tabs/HotelsTab';
import OwnerRoomsTab from './pages/Owner/tabs/RoomsTab';
import OwnerBookingsTab from './pages/Owner/tabs/BookingsTab';
import OwnerPersonalBookingsTab from './pages/Owner/tabs/PersonalBookingsTab';
import OwnerDiscountsTab from './pages/Owner/tabs/DiscountsTab';

// User Tab Components
import UserBookingsTab from './pages/User/tabs/BookingsTab';
import UserBecomeOwnerTab from './pages/User/tabs/BecomeOwnerTab';
import UserProfileTab from './pages/User/tabs/ProfileTab';
import UserWishlistTab from './pages/User/tabs/WishlistTab';


function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            
            <Route 
              path="/user-dashboard" 
              element={
                <ProtectedRoute requiredRole={['user', 'owner', 'admin']}>
                  <UserDashboard/>
                </ProtectedRoute>
              } 
            >
              <Route index element={<UserBookingsTab />} />
              <Route path="bookings" element={<UserBookingsTab />} />
              <Route path="become-owner" element={<UserBecomeOwnerTab />} />
              <Route path="profile" element={<UserProfileTab />} />
              <Route path="wishlist" element={<UserWishlistTab />} />
            </Route>
            
            <Route 
              path="/owner-dashboard" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerDashboard/>
                </ProtectedRoute>
              } 
            >
              <Route index element={<OwnerOverviewTab />} />
              <Route path="overview" element={<OwnerOverviewTab />} />
              <Route path="hotels" element={<OwnerHotelsTab />} />
              <Route path="rooms" element={<OwnerRoomsTab />} />
              <Route path="bookings" element={<OwnerBookingsTab />} />
              <Route path="my-personal-bookings" element={<OwnerPersonalBookingsTab />} />
              <Route path="discounts" element={<OwnerDiscountsTab />} />
            </Route>
            
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard/>
                </ProtectedRoute>
              } 
            >
              <Route index element={<AdminOverviewTab />} />
              <Route path="overview" element={<AdminOverviewTab />} />
              <Route path="users" element={<AdminUsersTab />} />
              <Route path="owner-requests" element={<AdminOwnerRequestsTab />} />
              <Route path="hotels" element={<AdminHotelsTab />} />
              <Route path="rooms" element={<AdminRoomsTab />} />
              <Route path="reports" element={<AdminReportsTab />} />
              <Route path="discounts" element={<AdminDiscountsTab />} />
            </Route>
            
            <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}>Page not found</div>} />
          </Routes>
        </main>
    </Router>
  );
}

export default App;
