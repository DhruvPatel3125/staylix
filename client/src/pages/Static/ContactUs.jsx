import React, { useState } from 'react';
import { showToast } from '../../utils/swal';
import './ContactUs.css';
import contactHero from '../../assets/contact-hero-premium.png';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast.success('Message sent! We will contact you shortly.');
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="contact-page-premium">
      {/* Hero Section */}
      <section className="contact-hero-premium" style={{ backgroundImage: `url(${contactHero})` }}>
        <div className="contact-hero-overlay">
          <div className="hero-text-center">
            <span className="premium-badge">Contact Us</span>
            <h1>Get in <span className="text-gradient">Touch</span></h1>
            <p>We're here to help you find your perfect stay. Reach out to us anytime.</p>
          </div>
        </div>
      </section>

      <div className="contact-container-modern">
        <div className="contact-grid-modern">
          {/* Info Panel */}
          <div className="contact-info-glass">
            <div className="info-content-wrap">
              <h2>Information</h2>
              <p className="info-intro">Our dedicated support team is available 24/7 to ensure your travel experience is flawless.</p>
              
              <div className="contact-info-list">
                <div className="info-item-modern">
                  <div className="info-icon-glow"><MapPin size={24} /></div>
                  <div className="info-text-modern">
                    <h4>Location</h4>
                    <p>123 Staylix Tower, Tech Park, Bangalore, 560001</p>
                  </div>
                </div>

                <div className="info-item-modern">
                  <div className="info-icon-glow"><Phone size={24} /></div>
                  <div className="info-text-modern">
                    <h4>Phone</h4>
                    <p>+91 1800-123-4567</p>
                  </div>
                </div>

                <div className="info-item-modern">
                  <div className="info-icon-glow"><Mail size={24} /></div>
                  <div className="info-text-modern">
                    <h4>Email</h4>
                    <p>support@staylix.com</p>
                  </div>
                </div>

                <div className="info-item-modern">
                  <div className="info-icon-glow"><Clock size={24} /></div>
                  <div className="info-text-modern">
                    <h4>Working Hours</h4>
                    <p>Mon - Sun: 24/7 Support</p>
                  </div>
                </div>
              </div>

              <div className="social-connect-premium">
                <h4>Follow our journey</h4>
                <div className="social-icons-row">
                  <div className="social-btn"><Globe size={20} /></div>
                  <div className="social-btn"><MessageSquare size={20} /></div>
                  <div className="social-btn"><Send size={20} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="contact-form-premium">
            {submitted ? (
              <div className="submission-success">
                <div className="success-anim-icon">✓</div>
                <h3>Message Received!</h3>
                <p>One of our travel experts will respond to your inquiry via email within 12 hours.</p>
                <button className="btn-outline-prem" onClick={() => setSubmitted(false)}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="premium-contact-form">
                <div className="form-head">
                  <h3>Send a Message</h3>
                  <p>Fill out the form below and we'll get back to you shortly.</p>
                </div>

                <div className="prem-form-grid">
                  <div className="prem-input-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="e.g. John Doe"
                      required 
                    />
                  </div>
                  <div className="prem-input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="john@example.com"
                      required 
                    />
                  </div>
                </div>

                <div className="prem-input-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    placeholder="How can we help?"
                    required 
                  />
                </div>

                <div className="prem-input-group">
                  <label>Message</label>
                  <textarea 
                    name="message" 
                    rows="5" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="prem-submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : <>Send Message <Send size={18} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
