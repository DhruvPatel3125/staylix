import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Send } from 'lucide-react';
import { addReviews } from '../store/slices/reviewSlice';
import { showToast } from '../utils/swal';
import './AddReview.css';

export default function AddReview({ hotelId, onReviewAdded }) {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { loading } = useSelector((state) => state.review);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast.error('Please select a rating');
      return;
    }

    try {
      const newReview = await dispatch(addReviews({
        reviewData: {
          hotelId,
          rating,
          comment
        }
      })).unwrap();
      
      showToast.success('Review added successfully');
      setRating(0);
      setComment('');
      if (onReviewAdded) {
        onReviewAdded(newReview);
      }
    } catch (err) {
      showToast.error(err || 'Failed to add review');
    }
  };

  return (
    <div className="add-review-container">
      <h3>Write a Review</h3>
      <form onSubmit={handleSubmit} className="add-review-form">
        <div className="rating-input">
          <label>Your Rating</label>
          <div className="stars-wrapper">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star size={24} fill={star <= (hoverRating || rating) ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div className="comment-input">
          <label htmlFor="comment">Your Experience</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your stay..."
            rows="4"
          />
        </div>

        <button 
          type="submit" 
          className="submit-review-btn" 
          disabled={loading}
        >
          {loading ? 'Submitting...' : (
            <>
              Submit Review <Send size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
