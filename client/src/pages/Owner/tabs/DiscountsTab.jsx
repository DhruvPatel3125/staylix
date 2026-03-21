import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, X, Calendar, Tag, Trash2, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { showToast, showAlert } from '../../../utils/swal';
import api from '../../../services/api';

export default function DiscountsTab() {
  const { 
    hotels,
    searchTerm, 
    setSearchTerm,
    fetchData
  } = useOutletContext();

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minBookingAmount: 0,
    applicableHotels: [],
    startDate: '',
    endDate: '',
    usageLimit: ''
  });

  const fetchDiscounts = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.discounts.getMyRequests();
      if (response.success) {
        setDiscounts(response.discounts || []);
      }
    } catch (err) {
      console.error('Fetch discounts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleRequestDiscount = async (e) => {
    e.preventDefault();
    
    if (newDiscount.applicableHotels.length === 0) {
      showToast.error('Please select at least one hotel');
      return;
    }

    try {
      setProcessingId('creating');
      const response = await api.discounts.request(newDiscount);
      if (response.success) {
        showToast.success('Discount request submitted for admin approval');
        setShowForm(false);
        setNewDiscount({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          minBookingAmount: 0,
          applicableHotels: [],
          startDate: '',
          endDate: '',
          usageLimit: ''
        });
        fetchDiscounts();
      } else {
        showAlert.error('Error', response.message || 'Failed to submit request');
      }
    } catch (err) {
      showAlert.error('Error', err.message || 'Failed to submit request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleHotel = (hotelId) => {
    setNewDiscount(prev => {
      const current = prev.applicableHotels;
      if (current.includes(hotelId)) {
        return { ...prev, applicableHotels: current.filter(id => id !== hotelId) };
      } else {
        return { ...prev, applicableHotels: [...current, hotelId] };
      }
    });
  };

  const filteredDiscounts = discounts.filter(d => 
    d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="status-pill-modern active"><CheckCircle size={14} /> Approved</span>;
      case 'rejected': return <span className="status-pill-modern blocked"><X size={14} /> Rejected</span>;
      default: return <span className="status-pill-modern pending"><Clock size={14} /> Pending Approval</span>;
    }
  };

  if (loading && discounts.length === 0) {
    return <div className="loading-state-premium">Loading your offers...</div>;
  }

  return (
    <div className="discounts-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-modern">
        <div className="header-info">
          <h2>Property Offers</h2>
          <p className="subtitle-admin">Request special discounts for your hotels to attract more guests.</p>
        </div>
        <div className="header-actions-premium">
           <div className="search-wrapper">
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              className="search-input-premium"
              placeholder="Search my offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className={`btn-premium-solid ${showForm ? 'cancel' : 'create'}`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Request Discount</>}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="discount-form-card-premium" style={{ animation: 'fadeInScale 0.6s ease-out both' }}>
           <div className="form-info-banner">
            <Info size={18} />
            <p>Your request will be reviewed by the administration. Approved discounts will automatically go live on the specified start date.</p>
          </div>
          <form className="modern-admin-form" onSubmit={handleRequestDiscount}>
            <div className="form-grid-modern">
              <div className="form-field-group">
                <label>Voucher Code</label>
                <div className="input-with-icon">
                   <Tag size={16} />
                   <input
                    type="text"
                    placeholder="e.g. SAVE20"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>
              <div className="form-field-group">
                <label>Discount Type</label>
                <select
                  value={newDiscount.discountType}
                  onChange={(e) => setNewDiscount({ ...newDiscount, discountType: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Flat Amount (₹)</option>
                </select>
              </div>
              <div className="form-field-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  placeholder="20"
                  value={newDiscount.discountValue}
                  onChange={(e) => setNewDiscount({ ...newDiscount, discountValue: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-field-group full-width">
              <label>Deal Description</label>
              <input
                type="text"
                className="full-input"
                placeholder="What is this offer for? (e.g. Weekend special)"
                value={newDiscount.description}
                onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                required
              />
            </div>

            <div className="form-grid-modern">
              <div className="form-field-group">
                <label>Validity Start</label>
                <input
                  type="datetime-local"
                  value={newDiscount.startDate}
                  onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-field-group">
                <label>Validity End</label>
                <input
                  type="datetime-local"
                  value={newDiscount.endDate}
                  onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-field-group">
                <label>Total Uses</label>
                <input
                  type="number"
                  placeholder="No limit if empty"
                  value={newDiscount.usageLimit}
                  onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="form-field-group full-width">
                <label>Apply to Properties</label>
                <div className="hotel-selection-grid">
                    {hotels.map(hotel => (
                        <div 
                            key={hotel._id} 
                            className={`hotel-select-card ${newDiscount.applicableHotels.includes(hotel._id) ? 'selected' : ''}`}
                            onClick={() => handleToggleHotel(hotel._id)}
                        >
                            <CheckCircle size={16} className="check-icon" />
                            <span>{hotel.name}</span>
                        </div>
                    ))}
                </div>
                {hotels.length === 0 && <p className="hint-text">You need to have at least one hotel to request a discount.</p>}
            </div>

            <div className="form-footer-premium">
               <button
                type="submit"
                className="btn-premium-solid create full"
                disabled={processingId === 'creating' || hotels.length === 0}
              >
                {processingId === 'creating' ? 'Submitting Request...' : 'Submit Request for Approval'}
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredDiscounts.length === 0 ? (
        <div className="empty-state-premium">
          <Tag size={48} className="empty-icon" />
          <h3>No Discount Requests Found</h3>
          <p>You haven't requested any discounts yet. Start by clicking the 'Request Discount' button.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.2s both' }}>
          <table className="admin-table-modern">
            <thead>
              <tr>
                <th>Offer Details</th>
                <th>Value</th>
                <th>Properties</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.map((discount, idx) => (
                <tr key={discount._id} style={{ animation: `slideInRight 0.4s ease-out ${idx * 0.05}s both` }}>
                  <td>
                    <div className="promo-cell">
                      <div className="promo-icon"><Tag size={18} /></div>
                      <div className="promo-info">
                        <span className="promo-code">{discount.code}</span>
                        <span className="promo-desc">{discount.description}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="benefit-cell">
                      <span className="benefit-val">
                        {discount.discountType === 'percentage' ? `${discount.discountValue}%` : `₹${discount.discountValue}`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="properties-cell">
                         <span className="count-pill">{discount.applicableHotels?.length || 0} Hotels</span>
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(discount.requestStatus)}
                    {discount.requestStatus === 'rejected' && (
                        <div className="rejection-hint">
                            <AlertCircle size={12} />
                            <span>{discount.rejectionReason || 'No reason specified'}</span>
                        </div>
                    )}
                  </td>
                  <td>
                    <div className="date-stack-modern">
                       <span>{new Date(discount.createdAt).toLocaleDateString()}</span>
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
