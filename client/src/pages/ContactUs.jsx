import React, { useState } from 'react';
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
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-us-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Get in touch with us!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <h3>📍 Visit Us</h3>
            <p>123 Staylix Tower, Tech Park</p>
            <p>Bangalore, Karnataka 560001</p>
            <p>India</p>
          </div>

          <div className="info-card">
            <h3>📞 Call Us</h3>
            <p>Support: +91 1800-123-4567</p>
            <p>Office: +91 80-1234-5678</p>
          </div>

          <div className="info-card">
            <h3>✉️ Email Us</h3>
            <p>support@staylix.com</p>
            <p>business@staylix.com</p>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          {submitted ? (
            <div className="success-message">
              <h3>Thank you for contacting us!</h3>
              <p>We have received your message and will get back to you shortly.</p>
              <button onClick={() => setSubmitted(false)} className="reset-btn">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your message here..."
                  rows="5"
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
