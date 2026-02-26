import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import HotelCard from '../../components/features/HotelCard/HotelCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Home.css';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await api.hotels.getAll();
        if (response.success) {
          setHotels(response.hotels || []);
        } else {
          setError(response.message || 'Failed to fetch hotels');
        }
      } catch {
        setError('Error fetching hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(hotel =>
        hotel.name?.toLowerCase().includes(term) ||
        hotel.description?.toLowerCase().includes(term) ||
        hotel.address?.city?.toLowerCase().includes(term)
      );
    }

    if (selectedCity) {
      result = result.filter(hotel =>
        hotel.address?.city?.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    if (minRating > 0) {
      result = result.filter(hotel => (hotel.rating || 0) >= minRating);
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [hotels, searchTerm, selectedCity, minRating, sortBy]);

  const uniqueCities = [...new Set(hotels.map(h => h.address?.city).filter(Boolean))].sort();

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  }

  if (isAuthenticated && user?.role === 'owner') {
    return <Navigate to="/owner-dashboard" />;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Find Your Perfect Stay</h1>
        <p>Discover amazing hotels at the best prices</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-filters-section">
        <div className="search-box">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search hotels by name, city or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="city-filter">City:</label>
            <select
              id="city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="filter-select"
            >
              <option value="">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="rating-filter">Min Rating:</label>
            <select
              id="rating-filter"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="filter-select"
            >
              <option value={0}>All Ratings</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Hotel Name</option>
              <option value="rating">Rating (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredHotels.length === 0 ? (
        <div className="empty-state">
          <p>No hotels found matching your criteria</p>
        </div>
      ) : (
        <div className="hotels-grid">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
}
