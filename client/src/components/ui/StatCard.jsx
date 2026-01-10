import React from 'react';
import './StatCard.css';

export default function StatCard({ icon: Icon, title, value, iconColor, iconBg, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        {Icon && <Icon size={28} />}
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
