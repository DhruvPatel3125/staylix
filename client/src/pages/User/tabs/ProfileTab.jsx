import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { User as UserIcon, Mail, Shield } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';
import './ProfileTab.css';

export default function ProfileTab() {
  const { user } = useOutletContext();

  return (
    <div className="profile-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="profile-header-premium">
        <div className={`profile-avatar-large ${user?.role}-avatar`}>
          {user?.profileImage ? (
            <img src={getImageUrl(user.profileImage)} alt={user.name} />
          ) : (
            <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <div className="profile-title-info">
          <h2>Profile Information</h2>
          <p className="profile-role-text">{user?.role?.toUpperCase()}</p>
        </div>
      </div>
      
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
