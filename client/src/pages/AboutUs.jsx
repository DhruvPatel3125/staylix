import React from 'react';
import './AboutUs.css';
import aboutHero from '../assets/about-hero.png';

export default function AboutUs() {
  return (
    <div className="about-us-container">
      {/* Hero Section */}
      <section className="about-hero" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${aboutHero})` }}>
        <div className="hero-content">
          <h1>Redefining Modern Stays</h1>
          <p>Your journey to comfort and luxury starts here. Staylix is more than just a booking platform; it's your gateway to unforgettable experiences.</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Happy Guests</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Luxury Hotels</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Customer Support</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.9/5</span>
            <span className="stat-label">Average Rating</span>
          </div>
        </div>
      </section>
      
      <div className="about-main-content">
        {/* Mission & Vision */}
        <section className="info-block">
          <div className="info-text">
            <h2>Our Mission</h2>
            <p>
              At Staylix, we are dedicated to bridging the gap between travelers and their ideal accommodations. 
              We believe that every stay should be seamless, transparent, and personalized. 
              Our platform leverages cutting-edge technology to ensure that you find the best value without compromising on quality.
            </p>
          </div>
          <div className="info-image mission-image"></div>
        </section>

        <section className="info-block reverse">
          <div className="info-text">
            <h2>Our Story</h2>
            <p>
              Founded in 2024, Staylix emerged from a vision to simplify the complex world of hospitality. 
              What started as a small team of travel enthusiasts has grown into a nationwide network of premium partners. 
              We continue to innovate and expand, always keeping the traveler's comfort at the heart of our mission.
            </p>
          </div>
          <div className="info-image story-image"></div>
        </section>

        {/* Values Section */}
        <section className="values-grid-section">
          <h2>Why Choose Staylix?</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">💎</div>
              <h3>Quality First</h3>
              <p>Every property is hand-picked and verified to meet our rigorous standards of excellence.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🏷️</div>
              <h3>Exclusive Deals</h3>
              <p>Access member-only rates and seasonal discounts that you won't find anywhere else.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>Your data is protected by industry-leading encryption, ensuring a worry-free booking process.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>Explore a diverse range of accommodations, from urban lofts to secluded beach villas.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
