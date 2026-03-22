import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, Hotel, Bed, Calendar, X, Star, Clock, ChevronRight } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';

export default function OverviewTab() {
  const { stats } = useOutletContext();
  const navigate = useNavigate();
  
  const nav = (path) => () => navigate(`/admin-dashboard/${path}`);

  return (
    <div className="overview-section">
      <div className="section-header-modern">
        <div className="header-info">
          <h2>Platform Overview</h2>
          <p className="subtitle-admin">Real-time performance metrics and platform distribution.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          iconColor="#6366f1" 
          iconBg="linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)" 
          onClick={nav('users')}
        />
        <StatCard 
          title="Total Hotels" 
          value={stats?.totalHotels || 0} 
          icon={Hotel} 
          iconColor="#10b981" 
          iconBg="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)" 
          onClick={nav('hotels')}
        />
        <StatCard 
          title="Total Rooms" 
          value={stats?.totalRooms || 0} 
          icon={Bed} 
          iconColor="#f59e0b" 
          iconBg="linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)" 
          onClick={nav('rooms')}
        />
        <StatCard 
          title="Total Bookings" 
          value={stats?.totalBookings || 0} 
          icon={Calendar} 
          iconColor="#3b82f6" 
          iconBg="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)" 
          onClick={nav('reports')}
        />
        <StatCard 
          title="Cancelled Bookings" 
          value={stats?.cancelledBookings || 0} 
          icon={X} 
          iconColor="#ef4444" 
          iconBg="linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)" 
          onClick={nav('reports')}
        />
        <StatCard 
          title="Total Reviews" 
          value={stats?.totalReviews || 0} 
          icon={Star} 
          iconColor="#f43f5e" 
          iconBg="linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(244, 63, 94, 0.05) 100%)" 
        />
        <StatCard 
          title="Pending Requests" 
          value={stats?.pendingOwnerRequests || 0} 
          icon={Clock} 
          iconColor="#8b5cf6" 
          iconBg="linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)" 
          onClick={nav('owner-requests')}
        />
      </div>

      <div className="summary-section">
        <div className="summary-header">
          <h3>Platform Summary</h3>
          <p>Quick breakdown of user engagement and financial health.</p>
        </div>
        <div className="summary-list">
          <div className="summary-item clickable-summary" onClick={nav('users')}>
            <div className="summary-info-main">
              <span className="label">Active Users</span>
              <span className="value">{stats?.activeUsers || 0}</span>
            </div>
            <ChevronRight className="summary-arrow" size={20} />
          </div>
          <div className="summary-item clickable-summary" onClick={nav('users')}>
            <div className="summary-info-main">
              <span className="label">Blocked Users</span>
              <span className="value">{stats?.blockedUsers || 0}</span>
            </div>
            <ChevronRight className="summary-arrow" size={20} />
          </div>
          <div className="summary-item clickable-summary" onClick={nav('users')}>
            <div className="summary-info-main">
              <span className="label">Verified Owners</span>
              <span className="value">{stats?.verifiedOwners || 0}</span>
            </div>
            <ChevronRight className="summary-arrow" size={20} />
          </div>
          <div className="summary-item clickable-summary" onClick={nav('reports')}>
            <div className="summary-info-main">
              <span className="label">Total Revenue</span>
              <span className="value">₹{stats?.revenue?.toLocaleString() || 0}</span>
            </div>
            <ChevronRight className="summary-arrow" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
