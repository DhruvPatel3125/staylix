import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import Navbar from './components/layout/Navbar/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import HotelDetails from './pages/Hotel/HotelDetails';
import UserDashboard from './pages/User/UserDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import OwnerDashboard from './pages/Owner/OwnerDashboard';
import AboutUs from './pages/Static/AboutUs';
import ContactUs from './pages/Static/ContactUs';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            
            <Route 
              path="/user-dashboard" 
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard/>
                                 </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/owner-dashboard" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerDashboard/>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard/>
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}>Page not found</div>} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
