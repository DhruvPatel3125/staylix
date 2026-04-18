import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus, Clock, CheckCircle, X, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';

export default function OwnerRequestsTab() {
  const { 
    ownerRequests, 
    handleApproveOwner, 
    handleRejectOwner, 
    processingId 
  } = useOutletContext();

  const pendingRequests = ownerRequests.filter(r => r.status === 'pending');
  const pastRequests = ownerRequests.filter(r => r.status !== 'pending');

  return (
    <div className="requests-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-modern">
        <div className="header-info">
          <h2>Verification Hub</h2>
          <p className="subtitle-admin">Review and authorize new property owner applications.</p>
        </div>
        <span className="count-pill">{pendingRequests.length} Pending</span>
      </div>

      <div className="requests-grid-modern">
        {pendingRequests.length === 0 ? (
          <div className="empty-state-premium">
            <p>No new verification requests at this time.</p>
          </div>
        ) : (
          pendingRequests.map((request, idx) => (
            <div 
              key={request._id} 
              className="request-card-premium"
              style={{ animation: `fadeInScale 0.6s ease-out ${idx * 0.1}s both` }}
            >
              <div className="request-card-header">
                <div className="user-icon-bg">
                  <UserPlus size={24} />
                </div>
                <div className="user-meta-header">
                  <h3>{request.userId?.name}</h3>
                  <span className="email-link">{request.userId?.email}</span>
                </div>
              </div>
              
              <div className="request-card-body">
                <div className="business-info-box">
                  <div className="info-label-mini">LEGAL BUSINESS ENTITY</div>
                  <div className="business-name-display">{request.businessName || "Not Specified"}</div>
                </div>

                <div className="request-metadata">
                  <div className="meta-item">
                     <Clock size={14} />
                     <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  {request.document && (
                    <a href={getImageUrl(request.document)} target="_blank" rel="noreferrer" className="doc-link">
                      <ArrowRight size={14} /> View Document
                    </a>
                  )}
                </div>

                {request.message && (
                  <div className="message-box-premium">
                    <p>"{request.message}"</p>
                  </div>
                )}
              </div>
              
              <div className="request-card-actions">
                <button
                  className="btn-premium-outline reject"
                  onClick={() => handleRejectOwner(request._id)}
                  disabled={processingId === request._id}
                >
                  Reject
                </button>
                <button
                  className="btn-premium-solid approve"
                  onClick={() => handleApproveOwner(request._id)}
                  disabled={processingId === request._id}
                >
                  Approve Application
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pastRequests.length > 0 && (
        <div className="past-history-section" style={{ marginTop: '4rem' }}>
          <h3 style={{margin:"20px"}} className="history-title">Recent Decisions</h3>
          <div className="admin-table-wrapper-premium">
            <table className="admin-table-modern">
               <thead>
                 <tr>
                    <th>Applicant</th>
                    <th>Decision</th>
                    <th>Date</th>
                 </tr>
               </thead>
               <tbody>
                  {pastRequests.slice(0, 5).map((request, idx) => (
                    <tr key={request._id} style={{ animation: `slideInRight 0.4s ease-out ${idx * 0.05}s both` }}>
                       <td>
                          <div className="user-profile-cell">
                             <div className="user-avatar-small">{request.userId?.name?.charAt(0)}</div>
                             <span>{request.userId?.name}</span>
                          </div>
                       </td>
                       <td>
                          <span className={`status-pill-modern ${request.status}`}>
                             {request.status}
                          </span>
                       </td>
                       <td className="meta-text">{new Date(request.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
