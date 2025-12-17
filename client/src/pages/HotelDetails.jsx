import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import './HotelDetails.css';

const getImageUrl = (photoPath) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http')) return photoPath;
  return `http://localhost:5000${photoPath}`;
};

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    discountCode: ''
  });
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hotelRes = await api.hotels.getById(id);
        const roomsRes = await api.rooms.getByHotel(id);
        const reviewsRes = await api.reviews.getByHotel(id);

        if (hotelRes.success) setHotel(hotelRes.hotel);
        if (roomsRes.success) setRooms(roomsRes.rooms || []);
        if (reviewsRes.success) setReviews(reviewsRes.reviews || []);
      } catch (err) {
        setError('Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBooking = (room) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleValidateDiscount = async () => {
    if (!bookingData.discountCode) {
      setDiscountError('Please enter a discount code');
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
      } else {
        setDiscountInfo(null);
        setDiscountError(response.message || 'Invalid discount code');
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
    if (!selectedRoom || !bookingData.checkIn || !bookingData.checkOut) {
      alert('Please fill all booking details');
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    const totalAmount = nights * selectedRoom.pricePerNight;

    try {
      const response = await api.bookings.create({
        roomId: selectedRoom._id,
        hotelId: hotel._id,
        ownerId: hotel.ownerId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
        totalAmount,
        discountCode: discountInfo ? bookingData.discountCode : undefined
      });

      if (response.success) {
        alert('Booking successful!');
        setShowBookingForm(false);
        setSelectedRoom(null);
        setBookingData({ checkIn: '', checkOut: '', guests: 1, discountCode: '' });
        setDiscountInfo(null);
        setDiscountError('');
      } else {
        alert(response.message || 'Booking failed');
      }
    } catch (err) {
      alert('Error creating booking');
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
        <div className="hotel-info">
          <h1>{hotel.name}</h1>
          <p className="location">📍 {hotel.address?.city}, {hotel.address?.state}, {hotel.address?.country}</p>
          <p className="description">{hotel.description}</p>
          <div className="amenities">
            {hotel.amenities?.map((amenity, i) => (
              <span key={i} className="amenity-badge">{amenity}</span>
            ))}
          </div>
          <div className="rating">⭐ Rating: {hotel.rating || 'Not rated'}</div>
        </div>
      </div>

      <div className="hotel-content">
        <section className="rooms-section">
          <h2>Available Rooms</h2>
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
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">{review.userId?.name}</span>
                    <span className="review-rating">⭐ {review.rating}/5</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
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
            <p className="booking-price">${selectedRoom.pricePerNight}/night</p>
            
            <form onSubmit={handleSubmitBooking}>
              <div className="form-group">
                <label htmlFor="checkIn">Check-in Date</label>
                <input
                  id="checkIn"
                  type="date"
                  value={bookingData.checkIn}
                  onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkOut">Check-out Date</label>
                <input
                  id="checkOut"
                  type="date"
                  value={bookingData.checkOut}
                  onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
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

              {bookingData.checkIn && bookingData.checkOut && (
                <div className="price-breakdown">
                  <div className="price-breakdown-item">
                    <span>Price per night:</span>
                    <span>${selectedRoom.pricePerNight}</span>
                  </div>
                  <div className="price-breakdown-item">
                    <span>Number of nights:</span>
                    <span>{Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))}</span>
                  </div>
                  {discountInfo && (
                    <>
                      <div className="price-breakdown-item">
                        <span>Original amount:</span>
                        <span>${(discountInfo.finalAmount + discountInfo.discountAmount).toFixed(2)}</span>
                      </div>
                      <div className="price-breakdown-item discount">
                        <span>Discount ({discountInfo.code}):</span>
                        <span>-${discountInfo.discountAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="price-breakdown-item total">
                    <span>Total:</span>
                    <span>
                      ${discountInfo 
                        ? discountInfo.finalAmount.toFixed(2)
                        : (Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) * selectedRoom.pricePerNight).toFixed(2)
                      }
                    </span>
                  </div>
                </div>
              )}

              <button type="submit" className="booking-submit-btn">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
