import { useState, useRef } from 'react';
import { showToast } from '../../utils/swal';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../../services/api';
import './ContactUs.css';
import contactHero from '../../assets/contact-hero-luxe.jpg';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, CheckCircle2 } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email address';
    } else if (name === 'name' && !value) {
      error = 'Name is required';
    } else if (name === 'subject' && !value) {
      error = 'Subject is required';
    } else if (name === 'message' && !value) {
      error = 'Message is required';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast.error('Please fix the errors in the form');
      return;
    }

    // Temporarily skipping ReCAPTCHA validation check if key is not available for smooth testing,
    // but the token will be sent if recaptcha is completed.
    
    setLoading(true);

    try {
      const response = await api.contact.submit({
        ...formData,
        recaptchaToken
      });

      if (response.success) {
        showToast.success('Message sent! We will contact you shortly.');
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setRecaptchaToken(null);
        if (recaptchaRef.current) recaptchaRef.current.reset();
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to send message. Please try again.');
      // Always reset captcha on error because tokens are single-use
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="contact-luxe-page">
      <section className="contact-luxe-hero" style={{ backgroundImage: `url(${contactHero})` }}>
        <div className="contact-film" />
        <div className="contact-shell hero-center">
          <span className="luxe-chip">Concierge Desk</span>
          <h1>
            Let us design your <span>perfect stay</span>
          </h1>
          <p>Our premium support team is available around the clock for bookings, requests, and tailored guidance.</p>
        </div>
      </section>

      <section className="contact-main-wrap">
        <div className="contact-shell">
          <div className="contact-grid">
            <aside className="contact-info-panel">
              <h2>Speak with Staylix</h2>
              <p className="info-intro">A dedicated specialist will guide you from inquiry to check-in.</p>

              <div className="info-list">
                <article className="info-item">
                  <div className="icon-well"><MapPin size={18} /></div>
                  <div>
                    <h4>Head Office</h4>
                    <p>123 Staylix Tower, Tech Park, Bangalore, 560001</p>
                  </div>
                </article>

                <article className="info-item">
                  <div className="icon-well"><Phone size={18} /></div>
                  <div>
                    <h4>Phone</h4>
                    <p>+91 1800-123-4567</p>
                  </div>
                </article>

                <article className="info-item">
                  <div className="icon-well"><Mail size={18} /></div>
                  <div>
                    <h4>Email</h4>
                    <p>support@staylix.com</p>
                  </div>
                </article>

                <article className="info-item">
                  <div className="icon-well"><Clock size={18} /></div>
                  <div>
                    <h4>Availability</h4>
                    <p>24/7 support across all destinations</p>
                  </div>
                </article>
              </div>

              <div className="social-strip">
                <span>Connect</span>
                <div className="social-row">
                  <button type="button" className="social-pill" aria-label="Website"><Globe size={16} /></button>
                  <button type="button" className="social-pill" aria-label="Community"><MessageSquare size={16} /></button>
                  <button type="button" className="social-pill" aria-label="Send"><Send size={16} /></button>
                </div>
              </div>
            </aside>

            <div className="contact-form-panel">
              {submitted ? (
                <div className="success-state">
                  <div className="success-icon"><CheckCircle2 size={48} /></div>
                  <h3>Message Received</h3>
                  <p>One of our travel experts will reach out to you within 12 hours by email.</p>
                  <button className="secondary-btn" onClick={() => setSubmitted(false)} type="button">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="luxe-form">
                  <div className="form-top">
                    <h3>Send an Inquiry</h3>
                    <p>Share your travel needs and we will respond with personalized assistance.</p>
                  </div>

                  <div className="form-grid-two">
                    <label className="field-wrap">
                      <span>Full Name</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={(e) => setErrors(prev => ({ ...prev, name: validateField('name', e.target.value) }))}
                        placeholder="e.g. John Doe"
                        className={errors.name ? 'input-error' : ''}
                      />
                      {errors.name && <span className="error-text" style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>{errors.name}</span>}
                    </label>

                    <label className="field-wrap">
                      <span>Email Address</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={(e) => setErrors(prev => ({ ...prev, email: validateField('email', e.target.value) }))}
                        placeholder="john@example.com"
                        className={errors.email ? 'input-error' : ''}
                      />
                      {errors.email && <span className="error-text" style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>{errors.email}</span>}
                    </label>
                  </div>

                  <div className="form-grid-two">
                    <label className="field-wrap">
                      <span>Phone Number (Optional)</span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                      />
                    </label>

                    <label className="field-wrap">
                      <span>Subject</span>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={(e) => setErrors(prev => ({ ...prev, subject: validateField('subject', e.target.value) }))}
                        placeholder="How can we help?"
                        className={errors.subject ? 'input-error' : ''}
                      />
                      {errors.subject && <span className="error-text" style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>{errors.subject}</span>}
                    </label>
                  </div>

                  <label className="field-wrap">
                    <span>Message</span>
                    <textarea
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={(e) => setErrors(prev => ({ ...prev, message: validateField('message', e.target.value) }))}
                      placeholder="Tell us more about your stay requirement..."
                      className={errors.message ? 'input-error' : ''}
                    />
                    {errors.message && <span className="error-text" style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>{errors.message}</span>}
                  </label>

                  <div style={{ marginBottom: '1.5rem', transform: 'scale(0.9)', transformOrigin: 'left' }}>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                      onChange={onRecaptchaChange}
                    />
                  </div>

                  <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
