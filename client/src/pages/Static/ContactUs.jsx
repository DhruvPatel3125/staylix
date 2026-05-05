import { useState } from 'react';
import { showToast } from '../../utils/swal';
import './ContactUs.css';
import contactHero from '../../assets/contact-hero-luxe.jpg';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, CheckCircle2 } from 'lucide-react';

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast.success('Message sent! We will contact you shortly.');
      setSubmitted(true);
    }, 1500);
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
                        placeholder="e.g. John Doe"
                        required
                      />
                    </label>

                    <label className="field-wrap">
                      <span>Email Address</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </label>
                  </div>

                  <label className="field-wrap">
                    <span>Subject</span>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                    />
                  </label>

                  <label className="field-wrap">
                    <span>Message</span>
                    <textarea
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your stay requirement..."
                      required
                    />
                  </label>

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
