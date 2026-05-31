import React, { useState } from 'react';
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
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock
} from 'lucide-react';

import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    
    setIsSubmitting(true);
    // Simulate a premium production-grade newsletter API dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail('');
    }, 1200);
  };

  return (
    <footer className="footer" aria-label="Staylix Main Footer">
      {/* Background visual atmospheric ambient glow */}
      <div className="footer-glow" />
      <div className="footer-ambient-mesh" />

      <div className="footer-content">
        {/* Symmetrical Grid Column System */}
        <div className="footer-grid">
          
          {/* Brand Vision Column */}
          <div className="footer-column brand-column">
            <Link to="/" className="footer-logo" id="footer-logo-link">
              <div className="logo-icon">
                <img src="/logo.png" alt="Staylix Premium Logo" className="footer-logo-img" />
              </div>
              <span className="logo-text">Stay<span className="brand-suffix">lix</span></span>
            </Link>

            <p className="footer-tagline">
              Elevating global hospitality with hand-curated luxury stays and flawless service. Experience travel redefined.
            </p>
            
            <div className="social-links" aria-label="Staylix social profiles">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-pill" title="Follow on Instagram" id="social-instagram">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-pill" title="Follow on Twitter" id="social-twitter">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-pill" title="Follow on LinkedIn" id="social-linkedin">
                <Linkedin size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-pill" title="Follow on Facebook" id="social-facebook">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Explore Navigation Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Explore</h3>
            <ul className="footer-links">
              <li>
                <Link to="/hotels" id="footer-link-luxury">
                  <Hotel size={14} className="link-icon" /> 
                  <span className="link-text-span">Luxury Hotels</span>
                  <ArrowRight size={12} className="hover-arrow" />
                </Link>
              </li>
              <li>
                <Link to="/hotels" id="footer-link-search">
                  <Search size={14} className="link-icon" /> 
                  <span className="link-text-span">Search by City</span>
                  <ArrowRight size={12} className="hover-arrow" />
                </Link>
              </li>
              <li>
                <Link to="/hotels" id="footer-link-offers">
                  <Tag size={14} className="link-icon" /> 
                  <span className="link-text-span">Exclusive Offers</span>
                  <ArrowRight size={12} className="hover-arrow" />
                </Link>
              </li>
              <li>
                <Link to="/about" id="footer-link-featured">
                  <Sparkles size={14} className="link-icon" /> 
                  <span className="link-text-span">Featured Stays</span>
                  <ArrowRight size={12} className="hover-arrow" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Resources Navigation Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              <li>
                <Link to="/contact" id="footer-link-contact">
                  <Phone size={14} className="link-icon" /> 
                  <span className="link-text-span">Contact Us</span>
                  <ArrowRight size={12} className="hover-arrow" />
                </Link>
              </li>
              <li>
                <Link to="/about" id="footer-link-about">
                  <Globe size={14} className="link-icon" /> 
                  <span className="link-text-span">About Staylix</span>
                  <ArrowRight size={12} className="hover-arrow" />
                </Link>
              </li>
              <li>
                <Link to="/contact" id="footer-link-help">
                  <HelpCircle size={14} className="link-icon" /> 
                  <span className="link-text-span">Help Center</span>
                  <ArrowRight size={12} className="hover-arrow" />
                </Link>
              </li>
              <li>
                <Link to="/contact" id="footer-link-terms">
                  <FileText size={14} className="link-icon" /> 
                  <span className="link-text-span">Terms of Service</span>
                  <ArrowRight size={12} className="hover-arrow" />
                </Link>
              </li>
            </ul>
          </div>

          {/* High-End Interactive Newsletter & Contact Coordinates */}
          <div className="footer-column contact-column">
            <h3 className="footer-heading">Get in Touch</h3>
            <div className="contact-info">
              <div className="contact-item">
                <div className="icon-wrapper">
                  <Mail size={15} />
                </div>
                <span className="contact-value">concierge@staylix.com</span>
              </div>
              <div className="contact-item">
                <div className="icon-wrapper">
                  <Phone size={15} />
                </div>
                <span className="contact-value">+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <div className="icon-wrapper">
                  <MapPin size={15} />
                </div>
                <span className="contact-value">Surat, Gujarat, India</span>
              </div>
            </div>

            {/* Newsletter input layout with interactive animations */}
            <form onSubmit={handleSubscribe} className="newsletter-box" id="footer-newsletter-form">
              {isSubscribed ? (
                <div className="newsletter-success">
                  <CheckCircle2 size={16} className="success-check" />
                  <span>Joined Staylix Club!</span>
                </div>
              ) : (
                <>
                  <input 
                    type="email" 
                    placeholder="Exclusive membership deals..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                    aria-label="Email address for membership updates"
                    className="newsletter-input"
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`newsletter-btn ${email.trim() ? 'active' : ''}`}
                    aria-label="Subscribe"
                  >
                    {isSubmitting ? '...' : 'Join'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Brand Trust Badges Row (Production standard addition) */}
        <div className="footer-trust-row">
          <div className="trust-badge">
            <Award size={18} className="trust-icon" />
            <div className="trust-text">
              <h4>Verified Luxury Stays</h4>
              <p>Strictly inspected boutique criteria</p>
            </div>
          </div>
          <div className="trust-badge">
            <Lock size={18} className="trust-icon" />
            <div className="trust-text">
              <h4>100% Secure Checkout</h4>
              <p>Razorpay & SSL encrypted transaction</p>
            </div>
          </div>
          <div className="trust-badge">
            <ShieldCheck size={18} className="trust-icon" />
            <div className="trust-text">
              <h4>Stay Guarantee</h4>
              <p>Complimentary booking protection</p>
            </div>
          </div>
        </div>

        {/* Footer Legal & Symmetrical Base Layout */}
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} Staylix. Built with flawless precision.
          </div>
          <div className="footer-bottom-links">
            <Link to="/" id="legal-privacy">Privacy Policy</Link>
            <span className="dot" aria-hidden="true" />
            <Link to="/" id="legal-security">Security Safeguards</Link>
            <span className="dot" aria-hidden="true" />
            <Link to="/" id="legal-sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
