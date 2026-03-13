import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, X, FileText } from 'lucide-react';

export default function BecomeOwnerTab() {
  const { 
    ownerRequest, 
    showOwnerRequestForm, 
    setShowOwnerRequestForm, 
    submittingRequest, 
    ownerRequestData, 
    setOwnerRequestData, 
    handleSubmitOwnerRequest,
    API_BASE_URL
  } = useOutletContext();

  return (
    <div className="owner-request-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <h2>Become an Owner</h2>
      <p className="section-subtitle">Submit your application to become a hotel owner and manage your properties</p>

      {ownerRequest ? (
        <div className="request-status-card">
          <div className="status-header">
            <h3>Your Owner Request</h3>
            <span className={`status-badge ${ownerRequest.status}`}>
              {ownerRequest.status.charAt(0).toUpperCase() + ownerRequest.status.slice(1)}
            </span>
          </div>
          <div className="status-details">
            <div className="detail-item">
              <span className="label">Business Name</span>
              <span className="value">{ownerRequest.businessName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Document</span>
              <span className="value">
                <a 
                  href={`${API_BASE_URL}/${ownerRequest.document?.replace(/\\/g, '/')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="doc-view-link"
                >
                  View Document
                </a>
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Submitted On</span>
              <span className="value">{new Date(ownerRequest.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {ownerRequest.status === 'pending' && (
            <p className="pending-message">
              <Clock size={16} /> Your request is under review. Admin will approve or reject it soon.
            </p>
          )}
          {ownerRequest.status === 'approved' && (
            <p className="approved-message">
              <CheckCircle size={16} /> Congratulations! Your request has been approved. You can now manage hotels and rooms.
            </p>
          )}
          {ownerRequest.status === 'rejected' && (
            <p className="rejected-message">
              <X size={16} /> Your request was rejected. Please contact support for more information.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="request-form-container">
            {!showOwnerRequestForm ? (
              <div className="empty-state-action">
                <FileText size={48} className="icon-muted" />
                <p>Start your journey as a Staylix partner today.</p>
                <button
                  className="submit-btn-premium"
                  onClick={() => setShowOwnerRequestForm(true)}
                >
                  Submit Owner Application
                </button>
              </div>
            ) : (
              <div className="form-content-modern">
                <h3>Submit Your Application</h3>
                <div className="premium-input-group">
                  <label>Business Name</label>
                  <input
                    type="text"
                    className="premium-input"
                    value={ownerRequestData.businessName}
                    onChange={(e) => setOwnerRequestData({ ...ownerRequestData, businessName: e.target.value })}
                    placeholder="Enter your business/hotel name"
                    required
                  />
                </div>

                <div className="premium-input-group">
                  <label>Identity/Business Document (PDF or Image)</label>
                  <input
                    type="file"
                    className="premium-input-file"
                    onChange={(e) => setOwnerRequestData({ ...ownerRequestData, document: e.target.files[0] })}
                    required
                    accept=".pdf,image/*"
                  />
                  <small className="input-helper">
                    Upload your business license or proof of ownership
                  </small>
                </div>

                <div className="form-actions-row">
                  <button
                    className="submit-btn-premium"
                    onClick={handleSubmitOwnerRequest}
                    disabled={submittingRequest}
                  >
                    {submittingRequest ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    className="cancel-btn-outline"
                    onClick={() => setShowOwnerRequestForm(false)}
                    disabled={submittingRequest}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="info-box-premium">
            <h4>What you'll need:</h4>
            <ul>
              <li>Business name or hotel name</li>
              <li>Valid business license or registration number</li>
              <li>Proof of ownership or authorization</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
