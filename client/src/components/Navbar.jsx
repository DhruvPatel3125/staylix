import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const isAdminOrOwner = isAuthenticated && (user?.role === 'admin' || user?.role === 'owner');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏨 Staylix
        </Link>
        <div className="navbar-menu">
          {isAdminOrOwner ? (
            <>
              {user?.role === 'owner' && (
                <Link to="/owner-dashboard" className="nav-link">Owner Dashboard</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin-dashboard" className="nav-link">Admin Dashboard</Link>
              )}
              <button onClick={logout} className="nav-button logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About Us</Link>
              <Link to="/contact" className="nav-link">Contact Us</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/user-dashboard" className="nav-link">My Bookings</Link>
                  <span className="nav-user">
                    {user?.name}
                  </span>
                  <button onClick={logout} className="nav-button logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-button">Login</Link>
                  <Link to="/register" className="nav-button signup-btn">Sign Up</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
