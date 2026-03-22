import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Star, Hotel, User } from 'lucide-react';
import { showAlert, showToast } from '../../../utils/swal';
import api from '../../../services/api';

export default function ReviewsTab() {
  const { 
    reviews, 
    setReviews,
    processingId,
    setProcessingId
  } = useOutletContext();

  const handleDeleteReview = async (reviewId) => {
    const confirmed = await showAlert.confirm(
      'Delete Review?',
      'Are you sure you want to delete this review? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setProcessingId(reviewId);
      const response = await api.reviews.delete(reviewId);
      if (response.success) {
        setReviews(reviews.filter(r => r._id !== reviewId));
        showToast.success('Review deleted successfully');
      } else {
        showAlert.error('Error', response.message || 'Failed to delete review');
      }
    } catch (_err) {
      showAlert.error('Error', 'Failed to delete review');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="reviews-section-admin" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-modern">
        <div className="header-info">
          <h2>Review Management</h2>
          <p className="subtitle-admin">Monitor and manage all guest feedback across the platform.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state-premium">
          <p>No reviews available</p>
        </div>
      ) : (
        <div className="admin-table-wrapper-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.2s both' }}>
          <table className="admin-table-modern">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Hotel</th>
                <th>Rating</th>
                <th>Comment</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, idx) => (
                <tr key={review._id} style={{ animation: `slideInRight 0.4s ease-out ${0.05 * idx}s both` }}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar-mini">
                        <User size={14} />
                      </div>
                      <div className="user-details-mini">
                        <span className="user-name-premium">{review.userId?.name}</span><br />
                        <span className="user-email-muted">{review.userId?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="hotel-info-cell-mini">
                      <Hotel size={14} className="hotel-icon-mini" />
                      <span className="hotel-name-mini">{review.hotelId?.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="review-rating-pill">
                      <Star size={14} fill="currentColor" />
                      <span>{review.rating}/5</span>
                    </div>
                  </td>
                  <td>
                    <p className="admin-review-comment" title={review.comment}>
                      {review.comment?.length > 60 ? review.comment.substring(0, 60) + '...' : review.comment}
                    </p>
                  </td>
                  <td>
                    <div className="compact-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="action-btn-circle delete"
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={processingId === review._id}
                        title="Delete Review"
                      >
                        {processingId === review._id ? '...' : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
