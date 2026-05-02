import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, ArrowRight, ShieldCheck, Heart, Coffee, Briefcase, Zap } from 'lucide-react';
import './HotelCard.css';
import { getImageUrl } from '../../../utils/imageUrl';
import OptimizedImage from '../../common/OptimizedImage';
import { useDispatch,useSelector } from 'react-redux';
import { toggleWishlist, toggleWishlistLocal } from '../../../store/slices/wishlistSlice';
import useAuth from '../../../hooks/useAuth';

function HotelCard({ hotel }) {
  // const [isWishlisted,setIsWishlisted] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const wishlist = useSelector(state =>state.wishlist.items)

  const isWishlisted = wishlist.includes(hotel._id);

  const handleWishlist = (e) =>{
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const payload = { hotelId: hotel._id, hotel };
    dispatch(toggleWishlistLocal(payload))
    dispatch(toggleWishlist(payload))
  }
  return (
    <Link to={`/hotel/${hotel._id}`} className="hotel-card-link">
      <div className="hotel-card premium-hotel-card-main">
        <div className="hotel-card-image">
          <OptimizedImage 
            src={hotel.photos?.[0] ? getImageUrl(hotel.photos[0]) : ''} 
            alt={hotel.name} 
          />
          <div className="card-badge-rating">
            <Star size={14} fill="currentColor" />
            <span>{hotel.rating || 0}</span>
            {hotel.reviewsCount > 0 && <span className="card-reviews-count">({hotel.reviewsCount})</span>}
          </div>

          {hotel.category === 'boutique' && (
            <div className="category-badge boutique-badge">
              <Zap size={12} fill="currentColor" />
              <span>Unique Stay</span>
            </div>
          )}
          {hotel.category === 'business' && (
            <div className="category-badge business-badge">
              <Briefcase size={12} fill="currentColor" />
              <span>Business Pro</span>
            </div>
          )}
          {hotel.category === 'luxury' && (
            <div className="category-badge luxury-badge">
              <Star size={12} fill="currentColor" />
              <span>Ultra Luxury</span>
            </div>
          )}
        
        <button className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={handleWishlist}>
          <Heart size={16}  fill={isWishlisted ? 'currentColor' : 'none'} /> 
        </button>
        </div>
        <div className="hotel-card-content">
          <h3 className="card-title">{hotel.name}</h3>
          <p className="hotel-location">
            <MapPin size={16} />
            <span>{hotel.address?.city}, {hotel.address?.country || hotel.address?.state}</span>
          </p>
          <p className="hotel-description">{hotel.description}</p>
          <div className="hotel-amenities">
            {hotel.amenities?.slice(0, 3).map((amenity, i) => (
              <span key={i} className="amenity-tag">{amenity}</span>
            ))}
            {hotel.amenities?.length > 3 && (
              <span className="amenity-tag-plus">+{hotel.amenities.length - 3}</span>
            )}
          </div>
          <div className="card-footer-actions">
            <button className="view-details-btn-premium">
              View Details <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(HotelCard);
