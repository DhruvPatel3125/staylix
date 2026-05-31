import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Map,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Users,
  Sparkles
} from 'lucide-react';
import './LuxuryHero.css';

const CATEGORY_OPTIONS = [
  { id: 'luxury', label: 'Luxury', icon: <Star size={14} aria-hidden="true" /> },
  { id: 'resort', label: 'Resort', icon: <Compass size={14} aria-hidden="true" /> },
  { id: 'boutique', label: 'Boutique', icon: <ShieldCheck size={14} aria-hidden="true" /> },
  { id: 'business', label: 'Business', icon: <Map size={14} aria-hidden="true" /> }
];

const HIGHLIGHTS = [
  { value: '3,000+', label: 'Curated Hotels' },
  { value: '120+', label: 'Destinations' },
  { value: '4.9/5', label: 'Guest Experience' }
];

function LuxuryHero() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [categories, setCategories] = useState(['luxury']);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const videoRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Attempt to play video manually if autoplay fails or delayed
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        console.log("Video autoplay blocked, waiting for user interaction");
      });
    }
  }, []);

  const handleToggleCategory = (categoryId) => {
    setCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((item) => item !== categoryId) : [...prev, categoryId]
    );
  };

  const buildSearchParams = (withMapView = false) => {
    const params = new URLSearchParams();
    const trimmedDestination = destination.trim();

    if (trimmedDestination) {
      params.set('q', trimmedDestination);
    }

    categories.forEach((categoryId) => params.append('category[]', categoryId));

    if (withMapView) {
      params.set('view', 'map');
    }

    return params.toString();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = buildSearchParams(false);
    navigate(`/hotels${query ? `?${query}` : ''}`);
  };

  const handleSearchByMap = () => {
    const query = buildSearchParams(true);
    navigate(`/hotels${query ? `?${query}` : ''}`);
  };

  return (
    <section className="luxury-hero" aria-label="Welcome to Staylix">
      {/* Background Visual Layer */}
      <div className="luxury-hero__media">
        {/* Placeholder image loaded instantly to prevent black screen */}
        <div className={`luxury-hero__placeholder ${videoLoaded ? 'is-hidden' : ''}`} />
        
        <video 
          ref={videoRef}
          className={`luxury-hero__video ${videoLoaded ? 'is-visible' : ''}`}
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src="/video/15768401-uhd_4096_2160_24fps.mp4" type="video/mp4" />
        </video>
        
        {/* Visual overlays for text readability & atmosphere */}
        <div className="luxury-hero__overlay" />
        <div className="luxury-hero__glow luxury-hero__glow--left" />
        <div className="luxury-hero__glow luxury-hero__glow--right" />
        <div className="luxury-hero__ambient-mesh" />
      </div>

      <div className="luxury-hero__container">
        {/* Left Side: Rich Copywriting & Brand Vision */}
        <div className="luxury-hero__content luxury-hero__content--animated">
          <span className="luxury-hero__eyebrow">
            <Sparkles size={12} className="sparkle-icon" />
            Curated Luxury Collection
          </span>
          <h1 className="luxury-hero__title">
            Reserve your next <br />
            <span className="gradient-highlight">extraordinary stay</span>
          </h1>
          <p className="luxury-hero__subtitle">
            Discover a handpicked ecosystem of sublime hotels and resorts. Staylix connects you to unforgettable hospitality with flawless execution.
          </p>

          <div className="luxury-hero__actions">
            <Link to="/hotels" className="luxury-hero__btn luxury-hero__btn--primary" id="hero-btn-explore">
              Explore Stays 
              <span className="arrow-wrapper">
                <ArrowRight size={18} className="arrow-icon" />
              </span>
            </Link>
            <Link to="/about" className="luxury-hero__btn luxury-hero__btn--ghost" id="hero-btn-about">
              Our Story
            </Link>
          </div>

          <ul className="luxury-hero__highlights" aria-label="Staylix platform statistics">
            {HIGHLIGHTS.map((item) => (
              <li key={item.label} className="luxury-hero__highlight-item">
                <span className="highlight-value">{item.value}</span>
                <span className="highlight-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: High-End Glassmorphic Booking Panel */}
        <form
          className="luxury-hero__booking-card luxury-hero__booking-card--animated"
          onSubmit={handleSearchSubmit}
          id="hero-booking-form"
        >
          <div className="luxury-hero__card-head">
            <h2>Plan Your Stay</h2>
            <p>Smart filters & real-time availability</p>
          </div>

          {/* Destination Search Field */}
          <div className={`luxury-hero__field ${focusedField === 'destination' ? 'is-focused' : ''}`}>
            <span className="field-label">Destination</span>
            <div className="luxury-hero__input-wrap">
              <MapPin size={18} className="input-icon" />
              <input
                id="hero-input-destination"
                type="text"
                placeholder="City, hotel, or destination..."
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                onFocus={() => setFocusedField('destination')}
                onBlur={() => setFocusedField(null)}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Calendar CheckIn / CheckOut Grid */}
          <div className="luxury-hero__field-grid">
            <div className={`luxury-hero__field ${focusedField === 'checkIn' ? 'is-focused' : ''}`}>
              <span className="field-label">Check In</span>
              <div className="luxury-hero__input-wrap">
                <CalendarDays size={18} className="input-icon" />
                <input
                  id="hero-input-checkin"
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(event) => {
                    const nextDate = event.target.value;
                    setCheckIn(nextDate);
                    if (checkOut && nextDate && checkOut < nextDate) {
                      setCheckOut('');
                    }
                  }}
                  onFocus={() => setFocusedField('checkIn')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div className={`luxury-hero__field ${focusedField === 'checkOut' ? 'is-focused' : ''}`}>
              <span className="field-label">Check Out</span>
              <div className="luxury-hero__input-wrap">
                <CalendarDays size={18} className="input-icon" />
                <input
                  id="hero-input-checkout"
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                  onFocus={() => setFocusedField('checkOut')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          {/* Guests Count Selection */}
          <div className={`luxury-hero__field ${focusedField === 'guests' ? 'is-focused' : ''}`}>
            <span className="field-label">Guests</span>
            <div className="luxury-hero__input-wrap">
              <Users size={18} className="input-icon" />
              <select 
                id="hero-select-guests"
                value={guests} 
                onChange={(event) => setGuests(event.target.value)}
                onFocus={() => setFocusedField('guests')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>
          </div>

          {/* Luxury Categories Chips Selection */}
          <div className="luxury-hero__category-group">
            <span className="field-label">Experience Type</span>
            <div className="luxury-hero__category-chips">
              {CATEGORY_OPTIONS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  id={`hero-chip-${id}`}
                  className={`luxury-hero__chip ${categories.includes(id) ? 'is-active' : ''}`}
                  onClick={() => handleToggleCategory(id)}
                  aria-pressed={categories.includes(id)}
                >
                  <span className="chip-icon">{icon}</span>
                  <span className="chip-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Booking Card Submit Triggers */}
          <div className="luxury-hero__card-actions">
            <button 
              type="button" 
              className="luxury-hero__map-btn" 
              onClick={handleSearchByMap}
              id="hero-btn-map"
            >
              <Map size={17} />
              Map View
            </button>
            <button 
              type="submit" 
              className="luxury-hero__search-btn"
              id="hero-btn-search"
            >
              <Search size={18} />
              Search Stays
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default LuxuryHero;
