import React from 'react';
import { useAuth } from '../../../context/authContext';
import './Sidebar.css';

export default function Sidebar({ items, activeTab, onTabChange }) {
  const { user } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      <div className="profile-card">
        <div className={`profile-avatar ${user?.role}-avatar`}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <span className={`role-badge ${user?.role}-badge`}>{user?.role}</span>
        </div>
      </div>

      <nav className="dashboard-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              {Icon && <Icon size={20} />} {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
