import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { User as UserIcon, Mail, Shield } from 'lucide-react';

export default function ProfileTab() {
  const { user } = useOutletContext();

  return (
    <div className="profile-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <h2>Profile Information</h2>
      
      <div className="profile-details-grid">
        <div className="profile-detail-card">
          <div className="detail-header">
            <UserIcon size={20} />
            <span>Full Name</span>
          </div>
          <p className="detail-value">{user?.name || 'N/A'}</p>
        </div>

        <div className="profile-detail-card">
          <div className="detail-header">
            <Mail size={20} />
            <span>Email Address</span>
          </div>
          <p className="detail-value">{user?.email || 'N/A'}</p>
        </div>

        <div className="profile-detail-card">
          <div className="detail-header">
            <Shield size={20} />
            <span>Account Status</span>
          </div>
          <p className="detail-value">
            <span className={`role-badge-premium ${user?.role}-badge`}>
              {user?.role?.toUpperCase() || 'USER'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
