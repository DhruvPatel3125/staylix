import React from 'react';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <div className="about-us-container">
      <div className="about-header">
        <h1>About Staylix</h1>
        <p>Your trusted partner for comfortable and affordable stays.</p>
      </div>
      
      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At Staylix, our mission is to connect travelers with the perfect accommodation 
            that suits their needs and budget. We believe that finding a place to stay 
            should be easy, transparent, and reliable.
          </p>
        </section>

        <section className="story-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2024, Staylix started with a simple idea: to make hotel booking 
            accessible to everyone. We have grown from a small startup to a platform 
            that hosts thousands of hotels and rooms across the country.
          </p>
        </section>

        <section className="values-section">
          <h2>Why Choose Us?</h2>
          <ul>
            <li><strong>Quality Assurance:</strong> We verify every hotel listed on our platform.</li>
            <li><strong>Best Prices:</strong> We offer competitive rates and exclusive deals.</li>
            <li><strong>24/7 Support:</strong> Our customer support team is always here to help.</li>
            <li><strong>Secure Booking:</strong> Your data and payments are always safe with us.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
