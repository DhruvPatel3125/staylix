import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, X, Calendar, Clock, Tag, Trash2, CheckCircle } from 'lucide-react';

export default function DiscountsTab() {
  const { 
    discounts, 
    searchTerm, 
    setSearchTerm, 
    showDiscountForm, 
    setShowDiscountForm, 
    newDiscount, 
    setNewDiscount, 
    handleCreateDiscount, 
    handleToggleDiscount, 
    handleDeleteDiscount, 
    processingId 
  } = useOutletContext();

  const filteredDiscounts = discounts.filter(d => 
    d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="discounts-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-modern">
        <div className="header-info">
          <h2>Promotions & Offers</h2>
          <p className="subtitle-admin">Create and manage marketing campaigns and platform discounts.</p>
        </div>
        <div className="header-actions-premium">
           <div className="search-wrapper">
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              className="search-input-premium"
              placeholder="Search by code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className={`btn-premium-solid ${showDiscountForm ? 'cancel' : 'create'}`}
            onClick={() => setShowDiscountForm(!showDiscountForm)}
          >
            {showDiscountForm ? <><X size={18} /> Close Form</> : <><Plus size={18} /> New Campaign</>}
          </button>
        </div>
      </div>

      {showDiscountForm && (
        <div className="discount-form-card-premium" style={{ animation: 'fadeInScale 0.6s ease-out both' }}>
          <form className="modern-admin-form" onSubmit={handleCreateDiscount}>
            <div className="form-grid-modern">
              <div className="form-field-group">
                <label>Promotion Code</label>
                <div className="input-with-icon">
                   <Tag size={16} />
                   <input
                    type="text"
                    placeholder="e.g. SUMMER2026"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>
              <div className="form-field-group">
                <label>Benefit Type</label>
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
              <label>Campaign Description</label>
              <input
                type="text"
                className="full-input"
                placeholder="Briefly describe this offer..."
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
                <label>Quota / Limit</label>
                <input
                  type="number"
                  placeholder="Unlimited if empty"
                  value={newDiscount.usageLimit}
                  onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="form-footer-premium">
               <button
                type="submit"
                className="btn-premium-solid create full"
                disabled={processingId === 'creating-discount'}
              >
                {processingId === 'creating-discount' ? 'Processing...' : 'Launch Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredDiscounts.length === 0 ? (
        <div className="empty-state-premium">
          <p>No active promotions matching your search.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.2s both' }}>
          <table className="admin-table-modern">
            <thead>
              <tr>
                <th>Promotion</th>
                <th>Benefit</th>
                <th>Performance</th>
                <th>Expiration</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
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
                      <span className="benefit-sub">Off Order</span>
                    </div>
                  </td>
                  <td>
                    <div className="usage-stack-premium">
                      <div className="usage-numbers">
                        <strong>{discount.usageCount}</strong>
                        <span>/ {discount.usageLimit || '∞'} used</span>
                      </div>
                      <div className="mini-progress-track">
                         <div 
                           className="mini-progress-bar" 
                           style={{ width: `${discount.usageLimit ? Math.min((discount.usageCount / discount.usageLimit) * 100, 100) : 10}%` }}
                         />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-stack-modern">
                       <Calendar size={14} />
                       <span>{new Date(discount.endDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill-modern ${discount.isActive ? 'active' : 'blocked'}`}>
                      {discount.isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td>
                    <div className="compact-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className={`action-btn-circle ${discount.isActive ? 'disable' : 'enable'}`}
                        onClick={() => handleToggleDiscount(discount._id)}
                        disabled={processingId === discount._id}
                        title={discount.isActive ? 'Pause Sale' : 'Resume Sale'}
                      >
                        {processingId === discount._id ? '...' : (discount.isActive ? <Clock size={18} /> : <CheckCircle size={18} />)}
                      </button>
                      <button
                        className="action-btn-circle delete"
                        onClick={() => handleDeleteDiscount(discount._id)}
                        disabled={processingId === discount._id}
                        title="Delete Discount"
                      >
                        {processingId === discount._id ? '...' : <Trash2 size={18} />}
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
