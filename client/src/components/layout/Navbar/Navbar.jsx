import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/authContext';
import { 
  Hotel, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Info, 
  MessageSquare,
  Home
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isAdminOrOwner = isAuthenticated && (user?.role === 'admin' || user?.role === 'owner');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Hotel size={24} />
          </div>
          <span className="logo-text">Stay<span>lix</span></span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="menu-links">
            {!location.pathname.includes('dashboard') && (
              <>
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                  <Home size={18} /> Home
                </Link>
                <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                  <Info size={18} /> About
                </Link>
                <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                  <MessageSquare size={18} /> Contact
                </Link>
                
                {isAuthenticated && !isAdminOrOwner && (
                  <Link to="/user-dashboard" className={`nav-link ${location.pathname === '/user-dashboard' ? 'active' : ''}`}>
                    <LayoutDashboard size={18} /> My Bookings
                  </Link>
                )}
              </>
            )}

            {isAdminOrOwner && (
              <>
                {user?.role === 'owner' && (
                  <Link to="/owner-dashboard" className={`nav-link ${location.pathname === '/owner-dashboard' ? 'active' : ''}`}>
                    <LayoutDashboard size={18} /> Owner Panel
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin-dashboard" className={`nav-link ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}>
                    <LayoutDashboard size={18} /> Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="menu-actions">
            {isAuthenticated ? (
              <div className="user-profile">
                <div className="user-info">
                  <UserIcon size={20} className="user-avatar-icon" />
                  <span className="user-name">{user?.name}</span>
                </div>
                <button onClick={logout} className="logout-btn-nav">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons-nav">
                <Link to="/login" className="login-btn-nav">Login</Link>
                <Link to="/register" className="signup-btn-nav">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
