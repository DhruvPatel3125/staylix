import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HotelDetails from './pages/HotelDetails';
import UserDashboard from './pages/UserDashbord';
import AdminDashbord from './pages/AdminDashbord';
import OwnerDashboard from './pages/OwnerDashbord';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';


import './App.css';

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
                  <AdminDashbord/>
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
