import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { getImageUrl } from '../../../utils/imageUrl';
import './Sidebar.css';


export default function Sidebar({ items, basePath = '' }) {
  const { user } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      <div className="profile-card">
        <div className={`profile-avatar ${user?.role}-avatar`}>
          {user?.profileImage ? (
            <img src={getImageUrl(user.profileImage)} alt={user.name} className="sidebar-avatar-img" />
          ) : (
            user?.name?.charAt(0)?.toUpperCase() || 'U'
          )}
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
          const targetPath = `${basePath}/${item.id === 'overview' ? '' : item.id}`.replace(/\/+$/, '');
          
          return (
            <NavLink
              key={item.id}
              to={targetPath || basePath || '/'}
              end={item.id === 'overview'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {Icon && <Icon size={20} />} {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
