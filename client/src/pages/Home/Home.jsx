import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import HotelCard from '../../components/features/HotelCard/HotelCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, Search, SlidersHorizontal, Navigation, Loader2, X } from 'lucide-react';
import { showToast } from '../../utils/swal';
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
  const [isLocating, setIsLocating] = useState(false);
  const [isNearbyMode, setIsNearbyMode] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await api.hotels.getAll();
      if (response.success) {
        setHotels(response.hotels || []);
        setIsNearbyMode(false);
      } else {
        setError(response.message || 'Failed to fetch hotels');
      }
    } catch {
      setError('Error fetching hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      showToast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setLoading(true);
          const response = await api.hotels.getNearby(latitude, longitude);
          
          if (response.success) {
            setHotels(response.hotels || []);
            setIsNearbyMode(true);
            showToast.success(`Found ${response.hotels.length} hotels near you!`);
          } else {
            showToast.error(response.message || "Failed to find nearby hotels");
          }
        } catch (err) {
          showToast.error("Failed to fetch nearby hotels from server");
        } finally {
          setIsLocating(false);
          setLoading(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Failed to get your location";
        if (error.code === 1) msg = "Location permission denied";
        showToast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

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
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search hotels by name, city or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button 
              className={`nearby-btn ${isNearbyMode ? 'active' : ''}`}
              onClick={isNearbyMode ? fetchHotels : handleFindNearMe}
              disabled={isLocating}
              title={isNearbyMode ? "Show all hotels" : "Find hotels near me"}
            >
              {isLocating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isNearbyMode ? (
                <X size={20} />
              ) : (
                <Navigation size={20} />
              )}
              <span>{isLocating ? 'Locating...' : isNearbyMode ? 'Show All' : 'Near Me'}</span>
            </button>
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
