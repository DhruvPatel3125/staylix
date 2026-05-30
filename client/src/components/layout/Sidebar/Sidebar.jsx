import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { getImageUrl } from '../../../utils/imageUrl';
import './Sidebar.css';

import UserAvatar from '../../ui/UserAvatar';

export default function Sidebar({ items, basePath = '' }) {
  const { user } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      <div className="profile-card">
        <UserAvatar user={user} size="medium" />
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
              {Icon && <Icon size={20} />}
              <span className="nav-item-label">{item.label}</span>
              {item.badge ? <span className="nav-item-badge">{item.badge}</span> : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
