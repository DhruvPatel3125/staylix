import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Clock, 
  Users, 
  ChevronRight, 
  X, 
  CheckCircle, 
  Info,
  Calendar,
  CreditCard,
  Tag,
  Edit2,
  Trash2
} from 'lucide-react';
import { showToast, showAlert } from '../../utils/swal';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import RoomCard from '../../components/features/RoomCard/RoomCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageUrl } from '../../utils/imageUrl';
import { validate, bookingSchema } from '../../utils/validation';
import AddReview from '../../components/AddReview';
import './HotelDetails.css';

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
    guests: 1,
    discountCode: ''
  });
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [availability, setAvailability] = useState({ 
    checking: false, 
    isAvailable: true, 
    message: '' 
  });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const hotelRes = await api.hotels.getById(id);
        const reviewsRes = await api.reviews.getByHotel(id);

        if (hotelRes.success) setHotel(hotelRes.hotel);
        if (reviewsRes.success) setReviews(reviewsRes.reviews || []);
      } catch (err) {
        setError('Failed to load hotel details');
      }
    };

    fetchHotelData();
  }, [id]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(prev => (rooms.length === 0 ? true : prev));
        const params = {};
        if (bookingData.checkIn && bookingData.checkOut) {
          params.checkIn = bookingData.checkIn;
          params.checkOut = bookingData.checkOut;
        }
        const roomsRes = await api.rooms.getByHotel(id, params);
        if (roomsRes.success) setRooms(roomsRes.rooms || []);
      } catch (err) {
        console.error("Failed to load rooms", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRooms, 300);
    return () => clearTimeout(timer);
  }, [id, bookingData.checkIn, bookingData.checkOut]);

  // Real-time Availability Check
  useEffect(() => {
    if (showBookingForm && selectedRoom && bookingData.checkIn && bookingData.checkOut) {
      const checkAvailability = async () => {
        try {
          setAvailability(prev => ({ ...prev, checking: true, message: '' }));
          const response = await api.bookings.checkAvailability({
            roomId: selectedRoom._id,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            guests: parseInt(bookingData.guests)
          });
          
          setAvailability({
            checking: false,
            isAvailable: response.available,
            message: response.available ? '' : response.message || 'Room not available for these dates'
          });
        } catch (err) {
          setAvailability(prev => ({ ...prev, checking: false }));
        }
      };

      const timer = setTimeout(checkAvailability, 500);
      return () => clearTimeout(timer);
    }
  }, [showBookingForm, selectedRoom, bookingData.checkIn, bookingData.checkOut, bookingData.guests]);

  const handleBooking = (room) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && hotel.ownerId && user._id === hotel.ownerId) {
      showToast.error("You cannot book a room in your own hotel");
      return;
    }

    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleValidateDiscount = async () => {
    if (!bookingData.discountCode) {
      setDiscountError('Please enter a discount code');
      showToast.error('Please enter a discount code');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      setDiscountError('Please select check-in and check-out dates first');
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    
    if (nights <= 0) {
      setDiscountError('Check-out must be after check-in');
      return;
    }

    const totalAmount = nights * selectedRoom.pricePerNight;

    try {
      setValidatingDiscount(true);
      setDiscountError('');
      const response = await api.discounts.validate(
        bookingData.discountCode,
        totalAmount,
        hotel._id
      );

      if (response.success) {
        setDiscountInfo(response.discount);
        setDiscountError('');
        showToast.success(`Discount applied: ${response.discount.code}`);
      } else {
        setDiscountInfo(null);
        setDiscountError(response.message || 'Invalid discount code');
        showToast.error(response.message || 'Invalid discount code');
      }
    } catch (err) {
      setDiscountInfo(null);
      setDiscountError(err.response?.data?.message || 'Failed to validate discount code');
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    // 1. Initial Checks
    if (!selectedRoom || !bookingData.checkIn || !bookingData.checkOut) {
      showToast.error('Please select both check-in and check-out dates.');
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      showToast.error('Check-out date must be after check-in date.');
      return;
    }

    // 2. Joi Schema Validation
    const validationErrors = validate(bookingSchema, {
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      discountCode: bookingData.discountCode
    });

    if (validationErrors) {
      const firstError = Object.values(validationErrors)[0];
      showToast.error(firstError);
      return;
    }

    try {
      // 3. Final Availability Check (Server-side)
      setAvailability(prev => ({ ...prev, checking: true, message: '' }));
      const availRes = await api.bookings.checkAvailability({
        roomId: selectedRoom._id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: parseInt(bookingData.guests)
      });

      if (!availRes.available) {
        setAvailability({
          checking: false,
          isAvailable: false,
          message: availRes.message || 'Room is no longer available for these dates'
        });
        showToast.error(availRes.message || 'Room is no longer available for these dates');
        return;
      }
      setAvailability(prev => ({ ...prev, checking: false, isAvailable: true }));

      // 4. Create Razorpay Order and Pending Booking
      const totalAmount = nights * selectedRoom.pricePerNight;
      const finalAmount = discountInfo ? discountInfo.finalAmount : totalAmount;
      
      const orderRes = await api.bookings.createPaymentOrder({
        roomId: selectedRoom._id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
        totalAmount,
        hotelId: hotel._id,
        ownerId: hotel.ownerId,
        discountCode: discountInfo ? bookingData.discountCode : undefined
      });
      
      if (!orderRes.success) {
        showToast.error('Failed to initiate payment. Please try again.');
        return;
      }

      const bookingId = orderRes.bookingId;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_Dz9hd6AMtKfCZE", // Use env var
        amount: orderRes.order.amount,
        currency: "INR",
        name: "Staylix",
        description: `Booking for ${hotel.name}`,
        image: "https://example.com/your_logo",
        order_id: orderRes.order.id,
        handler: async function (response) {
          try {
            // 2. Confirm the existing Pending Booking
            const bookingRes = await api.bookings.confirm({
              bookingId,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });

            if (bookingRes.success) {
              showToast.success('Congratulations! Your booking is successful.');
              setShowBookingForm(false);
              setSelectedRoom(null);
              setBookingData({ checkIn: null, checkOut: null, guests: 1, discountCode: '' });
              setDiscountInfo(null);
              setDiscountError('');
            } else {
              showToast.error(bookingRes.message || 'Booking failed');
            }
          } catch (err) {
            showToast.error(err.response?.data?.message || 'Error creating booking');
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: ""
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        showToast.error(response.error.description || 'Payment failed');
      });
      rzp1.open();

    } catch (err) {
      console.error('Booking Process Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error initiating booking process';
      showToast.error(errorMessage);
    }
  };
  const handleEditReview = async (review) => {
    setEditingReviewId(review._id);
    setEditReviewData({ rating: review.rating, comment: review.comment });
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const confirmed = await showAlert.confirm(
        'Delete Review?',
        'Are you sure you want to delete this review? This action cannot be undone.'
      );
      
      if (confirmed) {
        const response = await api.reviews.delete(reviewId);
        if (response.success) {
          setReviews(reviews.filter(r => r._id !== reviewId));
          showToast.success('Review deleted successfully');
        }
      }
    } catch (err) {
      showToast.error('Failed to delete review');
    }
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      const response = await api.reviews.update(editingReviewId, editReviewData);
      if (response.success) {
        setReviews(reviews.map(r => {
          if (r._id === editingReviewId) {
            // Merge response while preserving the populated userId object if needed
            const updated = { ...r, ...response.review };
            // If the response returned userId as a string (not populated) 
            // but we already have it as an object, preserve the object
            if (typeof response.review.userId === 'string' && typeof r.userId === 'object') {
              updated.userId = r.userId;
            }
            return updated;
          }
          return r;
        }));
        setEditingReviewId(null);
        showToast.success('Review updated successfully');
      }
    } catch (err) {
      showToast.error('Failed to update review');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading hotel details...</div>;
  }

  if (!hotel) {
    return <div className="error-container">Hotel not found</div>;
  }

  return (
    <div className="hotel-details-container">
      <div className="hotel-header">
        {hotel.photos?.[0] && (
          <img src={getImageUrl(hotel.photos[0])} alt={hotel.name} className="hotel-main-image" />
        )}
        <div className="hotel-info-premium">
          <div className="hotel-title-section">
            <h1 className="hotel-name-display">{hotel.name}</h1>
            <div className="hotel-rating-badge-top">
              <Star size={16} fill="currentColor" />
              <span>{hotel.rating || 0}</span>
              {hotel.reviewsCount > 0 && (
                <span className="reviews-count-header">({hotel.reviewsCount} {hotel.reviewsCount === 1 ? 'review' : 'reviews'})</span>
              )}
            </div>
          </div>
          <p className="location-premium">
            <MapPin size={18} /> 
            <span>{hotel.address?.city}, {hotel.address?.state}, {hotel.address?.country}</span>
          </p>
          <p className="description-premium">{hotel.description}</p>
          <div className="amenities-premium">
            {hotel.amenities?.map((amenity, i) => (
              <span key={i} className="amenity-badge-premium">
                <ShieldCheck size={14} /> {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hotel-content">
        <section className="rooms-section">
          <div className="rooms-section-header">
            <h2>Available Rooms</h2>
          </div>
          {rooms.length === 0 ? (
            <p className="no-rooms">No rooms available</p>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <RoomCard 
                  key={room._id} 
                  room={room} 
                  onBooking={handleBooking}
                />
              ))}
            </div>
          )}
        </section>

        <section className="reviews-section">
          <h2>Guest Reviews</h2>
          
          {isAuthenticated && (
            <AddReview 
              hotelId={id} 
              onReviewAdded={(newReview) => setReviews((prev) => [newReview, ...prev])} 
            />
          )}

          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                  <div key={review._id} className="review-item-premium">
                    <div className="review-header">
                      <div className="reviewer-meta">
                        <div className="reviewer-avatar">
                          {review.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="reviewer-name">{review.userId?.name}</span>
                      </div>
                      <div className="review-actions-wrapper">
                        <div className="review-rating-pill">
                          <Star size={14} fill="currentColor" />
                          <span>{review.rating}/5</span>
                        </div>
                        {user && (review.userId?._id === user._id || review.userId === user._id) && editingReviewId !== review._id && (
                          <div className="review-owner-actions">
                            <button onClick={() => handleEditReview(review)} className="review-action-btn edit" title="Edit Review">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteReview(review._id)} className="review-action-btn delete" title="Delete Review">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {editingReviewId === review._id ? (
                      <form onSubmit={handleUpdateReview} className="edit-review-form">
                        <div className="star-rating-edit">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={20}
                              fill={star <= editReviewData.rating ? "#ffc107" : "none"}
                              stroke={star <= editReviewData.rating ? "#ffc107" : "#cbd5e1"}
                              onClick={() => setEditReviewData({ ...editReviewData, rating: star })}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                        <textarea
                          value={editReviewData.comment}
                          onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                          className="edit-comment-area"
                          rows="3"
                        />
                        <div className="edit-actions">
                          <button type="button" onClick={() => setEditingReviewId(null)} className="cancel-edit">Cancel</button>
                          <button type="submit" className="save-edit">Save Changes</button>
                        </div>
                      </form>
                    ) : (
                      <p className="review-comment">{review.comment}</p>
                    )}
                  </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showBookingForm && selectedRoom && (
        <div className="modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowBookingForm(false)}>×</button>
            <h3>Book {selectedRoom.title}</h3>
            <p className="booking-price">₹{selectedRoom.pricePerNight}/night</p>
            
            <form onSubmit={handleSubmitBooking}>
              <div className="form-group">
                <label htmlFor="checkIn">Check-in Date</label>
                <DatePicker
                  selected={bookingData.checkIn}
                  onChange={(date) => {
                    const nextData = { ...bookingData, checkIn: date };
                    if (date && bookingData.checkOut && date >= bookingData.checkOut) {
                      nextData.checkOut = new Date(date.getTime() + 86400000);
                    }
                    setBookingData(nextData);
                    setDiscountInfo(null);
                  }}
                  selectsStart
                  startDate={bookingData.checkIn}
                  endDate={bookingData.checkOut}
                  minDate={new Date()}
                  placeholderText="Select check-in date"
                  className="date-picker-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkOut">Check-out Date</label>
                <DatePicker
                  selected={bookingData.checkOut}
                  onChange={(date) => {
                    setBookingData({ ...bookingData, checkOut: date });
                    setDiscountInfo(null);
                  }}
                  selectsEnd
                  startDate={bookingData.checkIn}
                  endDate={bookingData.checkOut}
                  minDate={bookingData.checkIn ? new Date(bookingData.checkIn.getTime() + 86400000) : new Date(new Date().getTime() + 86400000)}
                  placeholderText="Select check-out date"
                  className="date-picker-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="guests">Number of Guests</label>
                <input
                  id="guests"
                  type="number"
                  min="1"
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="discountCode">Discount Code (Optional)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="discountCode"
                    type="text"
                    placeholder="Enter discount code"
                    value={bookingData.discountCode}
                    onChange={(e) => {
                      setBookingData({...bookingData, discountCode: e.target.value.toUpperCase()});
                      setDiscountInfo(null);
                      setDiscountError('');
                    }}
                  />
                  <button 
                    type="button"
                    className="discount-apply-btn"
                    onClick={handleValidateDiscount}
                    disabled={validatingDiscount || !bookingData.checkIn || !bookingData.checkOut}
                  >
                    {validatingDiscount ? 'Validating...' : 'Apply'}
                  </button>
                </div>
                {discountError && (
                  <span className="discount-error">
                    {discountError}
                  </span>
                )}
                {discountInfo && (
                  <div className="discount-success">
                    {discountInfo.description}
                  </div>
                )}
              </div>

              {availability.message && (
                <div className="availability-warning" style={{ 
                  backgroundColor: '#fff5f5', 
                  color: '#c53030', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '1px solid #feb2b2'
                }}>
                  ⚠️ {availability.message}
                </div>
              )}

              {bookingData.checkIn && bookingData.checkOut && (bookingData.checkOut > bookingData.checkIn) && (
                <div className="price-breakdown">
                  <div className="price-breakdown-item">
                    <span>Price per night:</span>
                    <span>₹{selectedRoom.pricePerNight}</span>
                  </div>
                  <div className="price-breakdown-item">
                    <span>Number of nights:</span>
                    <span>{Math.ceil((bookingData.checkOut - bookingData.checkIn) / (1000 * 60 * 60 * 24))}</span>
                  </div>
                  {discountInfo && (
                    <>
                      <div className="price-breakdown-item">
                        <span>Original amount:</span>
                        <span>₹{(discountInfo.finalAmount + discountInfo.discountAmount).toFixed(2)}</span>
                      </div>
                      <div className="price-breakdown-item discount">
                        <span>Discount ({discountInfo.code}):</span>
                        <span>-₹{discountInfo.discountAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="price-breakdown-item total">
                    <span>Total:</span>
                    <span>
                      ₹{discountInfo 
                        ? discountInfo.finalAmount.toFixed(2)
                        : (Math.ceil((bookingData.checkOut - bookingData.checkIn) / (1000 * 60 * 60 * 24)) * selectedRoom.pricePerNight).toFixed(2)
                      }
                    </span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="booking-submit-btn"
                disabled={!availability.isAvailable || availability.checking || (bookingData.checkOut <= bookingData.checkIn)}
                style={{ opacity: (!availability.isAvailable || availability.checking) ? 0.6 : 1 }}
              >
                {availability.checking ? 'Checking Availability...' : (!availability.isAvailable ? 'Sold Out' : 'Confirm Booking')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
