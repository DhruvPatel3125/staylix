import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import './HotelCard.css';
import { getImageUrl } from '../../../utils/imageUrl';
import { useDispatch,useSelector } from 'react-redux';
import { toggleWishlist, toggleWishlistLocal } from '../../../store/slices/wishlistSlice';
import useAuth from '../../../hooks/useAuth';
export default function HotelCard({ hotel }) {

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
          {hotel.photos?.[0] ? (
            <img src={getImageUrl(hotel.photos[0])} alt={hotel.name} loading="lazy" />
          ) : (
            <div className="hotel-placeholder">
              <ShieldCheck size={48} />
            </div>
          )}
          <div className="card-badge-rating">
            <Star size={14} fill="currentColor" />
            <span>{hotel.rating || 'N/A'}</span>
          </div>
        
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
