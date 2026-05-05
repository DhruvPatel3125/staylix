import { useEffect } from 'react';
import './AboutUs.css';
import aboutHero from '../../assets/about-hero-luxe.jpg';
import { Target, Eye, Award, Globe, ShieldCheck, Zap, Users, Sparkles } from 'lucide-react';

export default function AboutUs() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-luxe-page">
      <section className="about-luxe-hero" style={{ backgroundImage: `url(${aboutHero})` }}>
        <div className="hero-film" />
        <div className="about-shell hero-inner">
          <div className="hero-luxe-card reveal-on-scroll">
            <span className="luxe-tag">Staylix Legacy</span>
            <h1>
              Crafted for <span>Extraordinary Stays</span>
            </h1>
            <p>
              Staylix curates elevated hospitality experiences where design, comfort, and trust meet in every
              reservation.
            </p>
            <div className="hero-metrics">
              <div>
                <strong>500+</strong>
                <span>Luxury Properties</span>
              </div>
              <div>
                <strong>10K+</strong>
                <span>Happy Guests</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>Average Rating</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-cue" />
      </section>

      <section className="about-story reveal-on-scroll">
        <div className="about-shell story-grid">
          <div className="story-copy">
            <span className="section-kicker">Our Story</span>
            <h2>Modern travel, timeless hospitality.</h2>
            <p>
              We began with one idea: premium travel should feel effortless from discovery to checkout. Our platform
              blends intelligent booking technology with deeply vetted properties to create stays that feel seamless,
              secure, and deeply memorable.
            </p>
            <div className="story-points">
              <article>
                <div className="point-icon">
                  <Target size={20} />
                </div>
                <div>
                  <h4>Mission</h4>
                  <p>Deliver trusted luxury experiences with transparency and precision.</p>
                </div>
              </article>
              <article>
                <div className="point-icon">
                  <Eye size={20} />
                </div>
                <div>
                  <h4>Vision</h4>
                  <p>Become the most admired hospitality platform for premium travelers.</p>
                </div>
              </article>
            </div>
          </div>

          <div className="story-visual">
            <div className="medal-card">
              <div className="medal-ring" />
              <Award size={72} />
              <p>Curated Excellence Standard</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-shell">
          <div className="values-head reveal-on-scroll">
            <span className="section-kicker">Why Staylix</span>
            <h2>The pillars behind every premium booking</h2>
          </div>

          <div className="values-grid">
            <article className="value-tile reveal-on-scroll">
              <div className="tile-icon"><Globe size={24} /></div>
              <h3>Global Curation</h3>
              <p>Distinctive destinations and high-end properties selected by hospitality specialists.</p>
            </article>
            <article className="value-tile reveal-on-scroll" style={{ transitionDelay: '0.08s' }}>
              <div className="tile-icon"><ShieldCheck size={24} /></div>
              <h3>Verified Quality</h3>
              <p>Each listing is assessed against rigorous quality, cleanliness, and service benchmarks.</p>
            </article>
            <article className="value-tile reveal-on-scroll" style={{ transitionDelay: '0.16s' }}>
              <div className="tile-icon"><Zap size={24} /></div>
              <h3>Real-Time Booking</h3>
              <p>Live availability and instant confirmation for a smooth, stress-free planning flow.</p>
            </article>
            <article className="value-tile reveal-on-scroll" style={{ transitionDelay: '0.24s' }}>
              <div className="tile-icon"><Users size={24} /></div>
              <h3>Concierge Care</h3>
              <p>24/7 human support whenever plans change or you need help during your journey.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-highlight reveal-on-scroll">
        <div className="about-shell highlight-grid">
          <div className="highlight-text">
            <div className="highlight-icon"><Sparkles size={20} /></div>
            <h3>Designed around unforgettable moments</h3>
            <p>
              From boutique villas to iconic city suites, Staylix ensures every stay delivers elegance, trust, and
              exceptional comfort.
            </p>
          </div>
          <button className="luxe-cta" onClick={() => window.location.href = '/'} type="button">
            Explore Properties
          </button>
        </div>
      </section>
    </div>
  );
}
