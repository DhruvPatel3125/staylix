import { useState, useEffect, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import HotelCard from '../../components/features/HotelCard/HotelCard';
import HotelCardSkeleton from '../../components/features/HotelCard/HotelCardSkeleton';
import CategoryBar from '../../components/features/CategoryBar/CategoryBar';
import MapView from '../../components/features/MapView/MapView';
import { Search, Navigation, Loader2, X, LayoutGrid, Map as MapIcon, ChevronDown } from 'lucide-react';
import { showToast } from '../../utils/swal';
import './Home.css';

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_COUNT = 8;

const HERO_CATEGORY_FILTERS = {
  luxury: {
    label: 'Luxury Hotels',
    keywords: ['luxury', 'premium', 'spa', 'suite', '5 star']
  },
  resort: {
    label: 'Beach Resorts',
    keywords: ['resort', 'beach', 'pool', 'sea', 'ocean']
  },
  boutique: {
    label: 'Boutique Stays',
    keywords: ['boutique', 'heritage', 'design', 'unique']
  },
  business: {
    label: 'Business Travel',
    keywords: ['business', 'corporate', 'conference', 'meeting']
  }
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [isLocating, setIsLocating] = useState(false);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const selectedCategories = useMemo(() => {
    const rawCategories = searchParams.getAll('category[]');
    const normalized = rawCategories
      .map((category) => category.toLowerCase())
      .filter((category) => HERO_CATEGORY_FILTERS[category]);

    return [...new Set(normalized)];
  }, [searchParams]);

  useEffect(() => {
    const cityParam = searchParams.get('city')?.trim() || '';
    const searchParam = searchParams.get('q')?.trim() || '';
    const ratingParam = Number(searchParams.get('rating'));
    const normalizedRating = Number.isFinite(ratingParam) && ratingParam > 0 ? ratingParam : 0;
    const viewParam = searchParams.get('view');

    setSelectedCity(cityParam);
    setSearchTerm(searchParam);
    setMinRating(normalizedRating);
    if (viewParam === 'map' || viewParam === 'list') {
      setViewMode(viewParam);
    }
  }, [searchParams]);

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

    if (selectedCategories.length > 0) {
      result = result.filter((hotel) => {
        const searchableText = [
          hotel.name,
          hotel.description,
          ...(hotel.amenities || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return selectedCategories.some((category) =>
          HERO_CATEGORY_FILTERS[category].keywords.some((keyword) =>
            searchableText.includes(keyword)
          )
        );
      });
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [hotels, searchTerm, selectedCity, minRating, selectedCategories, sortBy]);

  const uniqueCities = [...new Set(hotels.map(h => h.address?.city).filter(Boolean))].sort();
  const hasActiveFilters = Boolean(
    searchTerm ||
    selectedCity ||
    minRating > 0 ||
    selectedCategories.length > 0 ||
    isNearbyMode ||
    sortBy !== 'name'
  );

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setMinRating(0);
    setSortBy('name');
    setViewMode('list');
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category[]');
    nextParams.delete('city');
    nextParams.delete('q');
    nextParams.delete('rating');
    setSearchParams(nextParams);

    if (isNearbyMode) {
      fetchHotels();
    }
  };
  
  const handleCategoryToggle = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams);
    const currentCategories = nextParams.getAll('category[]');
    
    if (currentCategories.includes(categoryId)) {
      // Remove it
      const updated = currentCategories.filter(c => c !== categoryId);
      nextParams.delete('category[]');
      updated.forEach(c => nextParams.append('category[]', c));
    } else {
      // Add it
      nextParams.append('category[]', categoryId);
    }
    
    setSearchParams(nextParams);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + LOAD_MORE_COUNT);
      setIsLoadingMore(false);
    }, 400); // Small delay for smoother feel
  };

  const displayedHotels = useMemo(() => {
    return filteredHotels.slice(0, visibleCount);
  }, [filteredHotels, visibleCount]);

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

      <CategoryBar 
        activeCategories={selectedCategories} 
        onCategoryToggle={handleCategoryToggle} 
      />

      <div className="view-toggle-container">
        <div className="view-toggle-buttons">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <LayoutGrid size={18} /> <span>List View</span>
          </button>
          <button 
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <MapIcon size={18} /> <span>Map View</span>
          </button>
        </div>
        <div className="results-actions">
          <p className="results-count">Showing {filteredHotels.length} hotels</p>
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="hotels-grid">
          {[...Array(8)].map((_, i) => (
            <HotelCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="empty-state">
          <p>No hotels found matching your criteria</p>
        </div>
      ) : viewMode === 'map' ? (
        <MapView hotels={filteredHotels} />
      ) : (
        <>
          <div className="hotels-grid">
            {displayedHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
          
          {visibleCount < filteredHotels.length && (
            <div className="load-more-container">
              <button 
                className="load-more-btn" 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="load-more-spinner" size={20} />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Hotels</span>
                    <ChevronDown size={20} />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
