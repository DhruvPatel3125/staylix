import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Hotel, Star, Compass, Shield } from 'lucide-react';
import './HeroSection.css';

const HOTEL_CATEGORIES = [
  { name: 'category[]', value: 'luxury', label: 'Luxury Hotels', icon: <Star size={16} /> },
  { name: 'category[]', value: 'resort', label: 'Beach Resorts', icon: <Compass size={16} /> },
  { name: 'category[]', value: 'boutique', label: 'Boutique Stays', icon: <Hotel size={16} /> },
  { name: 'category[]', value: 'business', label: 'Business Travel', icon: <Shield size={16} /> },
];

const HERO_LINKS = [
  { to: '/hotels', label: 'EXPLORE HOTELS' },
  { to: '/about', label: 'OUR STORY' },
];

function HeroSection() {
  const videoUrl = '/video/15768401-uhd_4096_2160_24fps.mp4';



  return (
    <section className="hero-section">
      <div className="hero-video">
        <video 
          className="hero-video__media" 
          autoPlay 
          muted 
          loop 
          playsInline
          key={videoUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-video__overlay" />
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <h1 className="main-title">
            <span className="gradient-text">Discover Your Next</span>
            <span>Extraordinary Stay</span>
            <span className="sub-line">Luxury Accommodations Worldwide</span>
          </h1>
        </div>
        <div className="hero-buttons">
          {HERO_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className="hero-btn">
              {label}
            </Link>
          ))}
        </div>
        <div className="agency-tagline">
          <p>
            Staylix connects you with the world's most prestigious hotels and resorts.
          </p>
        </div>
      </div>

      <form action="/hotels" method="GET" className="property-filters-container">
        <div className="property-buttons">
          {HOTEL_CATEGORIES.map(({ name, value, label, icon }) => (
            <label key={`${name}-${value}`} className="filter-label">
              <input type="checkbox" name={name} value={value} className="filter-checkbox" />
              <div className="filter-btn">
                {icon} <span>{label}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="filter-action-buttons">
          <Link
            to="/hotels?view=map"
            className="search-map-btn"
          >
            <MapPin size={18} /> Search by map
          </Link>
          <button type="submit" className="search-properties-btn">
            <Search size={18} /> Find Your Perfect Stay
          </button>
        </div>
      </form>


    </section>
  );
}

export default HeroSection;
