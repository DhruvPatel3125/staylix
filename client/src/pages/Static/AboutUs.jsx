import React, { useEffect } from 'react';
import './AboutUs.css';
import aboutHero from '../../assets/about-hero-premium.png';
import { Target, Eye, Award, Globe, ShieldCheck, Zap, Users } from 'lucide-react';

export default function AboutUs() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page-premium">
      {/* Hero Section */}
      <section className="about-hero-modern" style={{ backgroundImage: `url(${aboutHero})` }}>
        <div className="hero-content-wrapper">
          <div className="glass-hero-card">
            <span className="badge-premium-static">Since 2024</span>
            <h1>Redefining <span className="text-gradient">Hospitality</span></h1>
            <p className="hero-description">
              Staylix is a premier ecosystem connecting travelers with curated luxury stays. 
              We believe every journey deserves a touch of elegance and absolute comfort.
            </p>
            <div className="hero-stats-mini">
              <div className="mini-stat">
                <strong>500+</strong>
                <span>Properties</span>
              </div>
              <div className="mini-stat">
                <strong>10k+</strong>
                <span>Stays</span>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator"></div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section reveal-on-scroll">
        <div className="section-container">
          <div className="philosophy-grid">
            <div className="philosophy-text">
              <span className="section-subtitle">Our Philosophy</span>
              <h2>Innovation meets <br/> timeless comfort.</h2>
              <p>
                Staylix was born from a simple realization: booking a luxury stay shouldn't be a transaction; it should be the start of an experience. 
                We've built a platform that handles the complexity so you can focus on the memories.
              </p>
              <div className="philosophy-icons">
                <div className="p-icon-item">
                  <div className="p-icon-box"><Target size={24} /></div>
                  <div className="p-icon-info">
                    <h4>Our Mission</h4>
                    <p>To democratize luxury stays through transparency and intelligent technology.</p>
                  </div>
                </div>
                <div className="p-icon-item">
                  <div className="p-icon-box"><Eye size={24} /></div>
                  <div className="p-icon-info">
                    <h4>Our Vision</h4>
                    <p>To become the world's most trusted partner for refined travel experiences.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="philosophy-visual">
               <div className="floating-img-card">
                  <div className="visual-circle"></div>
                  <Award size={64} className="visual-icon-main" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="values-section-premium">
        <div className="section-container">
           <div className="text-center-premium reveal-on-scroll">
             <span className="section-subtitle">Why Staylix?</span>
             <h2>The Pillars of Our Platform</h2>
           </div>
           
           <div className="values-grid-modern">
             <div className="value-card-premium reveal-on-scroll">
               <div className="v-icon-glow"><Globe size={32} /></div>
               <h3>Global Network</h3>
               <p>Access hand-picked partners across the most breathtaking locations in India and beyond.</p>
             </div>
             <div className="value-card-premium reveal-on-scroll" style={{ transitionDelay: '0.1s' }}>
               <div className="v-icon-glow"><ShieldCheck size={32} /></div>
               <h3>Verified Stays</h3>
               <p>Every property undergoes a 50-point quality check to ensure it meets our gold standards.</p>
             </div>
             <div className="value-card-premium reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
               <div className="v-icon-glow"><Zap size={32} /></div>
               <h3>Instant Booking</h3>
               <p>No waiting for approvals. Real-time availability and immediate confirmation for every room.</p>
             </div>
             <div className="value-card-premium reveal-on-scroll" style={{ transitionDelay: '0.3s' }}>
               <div className="v-icon-glow"><Users size={32} /></div>
               <h3>24/7 Support</h3>
               <p>Our concierge team is always just a click away, ready to assist with any request.</p>
             </div>
           </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <div className="cta-overlay-premium">
          <div className="cta-card-glass reveal-on-scroll">
            <h2>Ready for an unforgettable stay?</h2>
            <p>Join thousands of travelers who have found their perfect home away from home with Staylix.</p>
            <button className="btn-premium-solid" onClick={() => window.location.href='/'}>Explore Properties</button>
          </div>
        </div>
      </section>
    </div>
  );
}

