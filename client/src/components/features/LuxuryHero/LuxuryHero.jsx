import { useState } from 'react';
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
  Users
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

  const today = new Date().toISOString().split('T')[0];

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
    <section className="luxury-hero">
      <div className="luxury-hero__media">
        <video className="luxury-hero__video" autoPlay muted loop playsInline>
          <source src="/video/15768401-uhd_4096_2160_24fps.mp4" type="video/mp4" />
        </video>
        <div className="luxury-hero__overlay" />
        <div className="luxury-hero__glow luxury-hero__glow--left" />
        <div className="luxury-hero__glow luxury-hero__glow--right" />
      </div>

      <div className="luxury-hero__container">
        <div className="luxury-hero__content luxury-hero__content--animated">
          <span className="luxury-hero__eyebrow">Curated Luxury Collection</span>
          <h1 className="luxury-hero__title">
            Reserve your next <span>extraordinary stay</span>
          </h1>
          <p className="luxury-hero__subtitle">
            From skyline suites to private island resorts, Staylix helps you book unforgettable
            hospitality with confidence.
          </p>

          <div className="luxury-hero__actions">
            <Link to="/hotels" className="luxury-hero__btn luxury-hero__btn--primary">
              Explore Stays <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="luxury-hero__btn luxury-hero__btn--ghost">
              Our Story
            </Link>
          </div>

          <ul className="luxury-hero__highlights" aria-label="Staylix highlights">
            {HIGHLIGHTS.map((item) => (
              <li key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <form
          className="luxury-hero__booking-card luxury-hero__booking-card--animated"
          onSubmit={handleSearchSubmit}
        >
          <div className="luxury-hero__card-head">
            <h2>Plan Your Stay</h2>
            <p>Smart search with premium filters</p>
          </div>

          <label className="luxury-hero__field">
            <span>Destination</span>
            <div className="luxury-hero__input-wrap">
              <MapPin size={18} />
              <input
                type="text"
                placeholder="City, hotel, or landmark"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </div>
          </label>

          <div className="luxury-hero__field-grid">
            <label className="luxury-hero__field">
              <span>Check In</span>
              <div className="luxury-hero__input-wrap">
                <CalendarDays size={18} />
                <input
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
                />
              </div>
            </label>

            <label className="luxury-hero__field">
              <span>Check Out</span>
              <div className="luxury-hero__input-wrap">
                <CalendarDays size={18} />
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                />
              </div>
            </label>
          </div>

          <label className="luxury-hero__field">
            <span>Guests</span>
            <div className="luxury-hero__input-wrap">
              <Users size={18} />
              <select value={guests} onChange={(event) => setGuests(event.target.value)}>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>
          </label>

          <div className="luxury-hero__category-group">
            <span className="luxury-hero__field-label">Experience Type</span>
            <div className="luxury-hero__category-chips">
              {CATEGORY_OPTIONS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`luxury-hero__chip ${categories.includes(id) ? 'is-active' : ''}`}
                  onClick={() => handleToggleCategory(id)}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="luxury-hero__card-actions">
            <button type="button" className="luxury-hero__map-btn" onClick={handleSearchByMap}>
              <Map size={17} />
              Explore on Map
            </button>
            <button type="submit" className="luxury-hero__search-btn">
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
