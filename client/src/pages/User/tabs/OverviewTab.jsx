import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Calendar, 
  Heart, 
  MapPin, 
  ChevronRight, 
  Clock, 
  Star,
  Hotel as HotelIcon
} from 'lucide-react';

export default function OverviewTab() {
  const { 
    user, 
    bookings, 
    wishlistedHotels,
    formatDate,
    getImageUrl
  } = useOutletContext();

  const activeBookings = bookings.filter(b => {
    const status = new Date(b.checkOut) >= new Date() && b.bookingStatus !== 'cancelled';
    return status;
  });

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="overview-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      {/* Welcome Banner */}
      <div className="welcome-banner-premium" style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '3rem',
        borderRadius: '32px',
        color: 'white',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white' }}>
            Hello, {user?.name.split(' ')[0]}! 👋
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '500px' }}>
            Ready for your next adventure? You have {activeBookings.length} upcoming {activeBookings.length === 1 ? 'trip' : 'trips'} planned.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link to="/" className="explore-btn-glass" style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '0.8rem 1.8rem',
              borderRadius: '14px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: center,
              gap: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              Explore Hotels <ChevronRight size={18} />
            </Link>
          </div>
        </div>
        {/* Background Decorative Rings */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1
        }}></div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-premium" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2rem',
        marginBottom: '3.5rem'
      }}>
        <div className="stat-card-premium">
          <div className="stat-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Bookings</span>
            <span className="stat-value">{bookings.length}</span>
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-icon-box" style={{ background: '#f0fdf4', color: '#22c55e' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Upcoming Stays</span>
            <span className="stat-value">{activeBookings.length}</span>
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-icon-box" style={{ background: '#fff1f2', color: '#f43f5e' }}>
            <Heart size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Saved Hotels</span>
            <span className="stat-value">{wishlistedHotels.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
        {/* Recent Bookings */}
        <div className="recent-activity-card">
          <div style={{ display: 'flex', justifyContent: space-between, alignItems: center, marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Recent Activity</h3>
            <Link to="/user-dashboard/bookings" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '24px' }}>
              <p style={{ color: '#64748b' }}>No recent activity to show.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recentBookings.map(booking => (
                <div key={booking._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.2rem',
                  background: '#f8fafc',
                  borderRadius: '20px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: center,
                    justifyContent: center,
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {booking.hotelId?.images?.[0] ? (
                      <img src={getImageUrl(booking.hotelId.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <HotelIcon size={24} color="#94a3b8" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700 }}>{booking.hotelId?.name}</h4>
                    <div style={{ display: 'flex', alignItems: center, gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: center, gap: '0.3rem' }}>
                        <Calendar size={14} /> {formatDate(booking.checkIn)}
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: 600, color: booking.bookingStatus === 'cancelled' ? '#ef4444' : '#4f46e5' }}>
                        {booking.bookingStatus || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>
                    ₹{booking.totalAmount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions / Tips */}
        <div className="quick-tips-card" style={{
          background: '#f8fafc',
          padding: '2.5rem',
          borderRadius: '32px',
          height: 'fit-content'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Travel Tips</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: center, justifyContent: center, flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <Star size={20} color="#f59e0b" fill="#f59e0b" />
              </div>
              <div>
                <h5 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Rate your stay</h5>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                  Help other travelers by leaving reviews for your completed trips.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: center, justifyContent: center, flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <MapPin size={20} color="#ef4444" />
              </div>
              <div>
                <h5 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Stay Flexible</h5>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                  Use our interactive map search to find hidden gems in your preferred city.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
