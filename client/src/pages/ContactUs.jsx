import React, { useState } from 'react';
import { showToast, showAlert } from '../utils/swal';
import './ContactUs.css';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    showToast.success('We have received your message!');
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };


  return (
    <div className="contact-us-container">
      <div className="contact-hero">
        <div className="hero-overlay">
          <h1>Let's Connect</h1>
          <p>Have questions or feedback? We're here to help you every step of the way.</p>
        </div>
      </div>

      <div className="contact-grid">
        {/* Contact info side */}
        <div className="contact-info-panel">
          <div className="info-wrap">
            <h2>Contact Information</h2>
            <p className="info-sub">Our team is available 24/7 to assist you. Reach out through any of these channels.</p>
            
            <div className="contact-methods">
              <div className="method-item">
                <div className="method-icon">📍</div>
                <div className="method-text">
                  <h3>Headquarters</h3>
                  <p>123 Staylix Tower, Tech Park, Bangalore, India 560001</p>
                </div>
              </div>

              <div className="method-item">
                <div className="method-icon">📞</div>
                <div className="method-text">
                  <h3>Phone Support</h3>
                  <p>Support: +91 1800-123-4567</p>
                  <p>Office: +91 80-1234-5678</p>
                </div>
              </div>

              <div className="method-item">
                <div className="method-icon">✉️</div>
                <div className="method-text">
                  <h3>Email Address</h3>
                  <p>support@staylix.com</p>
                  <p>partnership@staylix.com</p>
                </div>
              </div>
            </div>

            <div className="social-links">
              <span className="social-icon">𝕏</span>
              <span className="social-icon">🔗</span>
              <span className="social-icon">📸</span>
              <span className="social-icon">📘</span>
            </div>
          </div>
        </div>

        {/* Form panel side */}
        <div className="contact-form-panel">
          {submitted ? (
            <div className="success-overlay">
              <div className="success-card">
                <div className="success-icon">✓</div>
                <h3>Message Sent Successfully!</h3>
                <p>One of our representatives will get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="return-btn">Send Another Message</button>
              </div>
            </div>
          ) : (
            <div className="form-card">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit} className="premium-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder=""
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder=""
                  />
                </div>

                <div className="form-group">
                  <label>Your Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder=""
                    rows="6"
                  ></textarea>
                </div>

                <button type="submit" className="glow-submit-btn">
                  Send Message
                  <span className="btn-arrow">→</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
