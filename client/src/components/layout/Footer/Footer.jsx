import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Hotel,
  Search,
  Tag,
  Globe,
  HelpCircle,
  FileText,
  ShieldCheck
} from 'lucide-react';

import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-column brand-column">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">
                <img src="/logo.png" alt="Staylix Logo" />
              </div>
              <span className="logo-text">Stay<span>lix</span></span>
            </Link>

            <p className="footer-tagline">
              Elevating your travel experience with curated luxury and seamless precision. Discover the world's most exquisite stays.
            </p>
            <div className="social-links">
              <a href="#" className="social-pill" title="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="social-pill" title="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-pill" title="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className="social-pill" title="Facebook">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div className="footer-column">
            <h3>Explore</h3>
            <ul className="footer-links">
              <li><Link to="/"><Hotel size={14} /> Luxury Hotels</Link></li>
              <li><Link to="/"><Search size={14} /> Search by City</Link></li>
              <li><Link to="/"><Tag size={14} /> Exclusive Offers</Link></li>
              <li><Link to="/about"><Sparkles size={14} /> Featured Stays</Link></li>
            </ul>

          </div>

          {/* Support Column */}
          <div className="footer-column">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><Link to="/contact"><Phone size={14} /> Contact Us</Link></li>
              <li><Link to="/about"><Globe size={14} /> About Staylix</Link></li>
              <li><Link to="/contact"><HelpCircle size={14} /> Help Center</Link></li>
              <li><Link to="/contact"><FileText size={14} /> Terms of Service</Link></li>
            </ul>

          </div>

          {/* Newsletter / Contact Column */}
          <div className="footer-column contact-column">
            <h3>Get in Touch</h3>
            <div className="contact-info">
              <div className="contact-item">
                <div className="icon-wrapper">
                  <Mail size={16} />
                </div>
                <span>concierge@staylix.com</span>
              </div>
              <div className="contact-item">
                <div className="icon-wrapper">
                  <Phone size={16} />
                </div>
                <span>+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <div className="icon-wrapper">
                  <MapPin size={16} />
                </div>
                <span>Surat, Gujarat, India</span>
              </div>
            </div>
            <div className="newsletter-box">
              <input type="email" placeholder="Your email address" />
              <button>Join</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} Staylix. Built for Excellence.
          </div>
          <div className="footer-bottom-links">
            <Link to="/">Privacy Policy</Link>
            <span className="dot"></span>
            <Link to="/">Security</Link>
            <span className="dot"></span>
            <Link to="/">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
