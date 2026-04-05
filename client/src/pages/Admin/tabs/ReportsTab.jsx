import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Briefcase, Hotel, Calendar, Download } from 'lucide-react';
import { exportToCSV } from '../../../utils/csvExport';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';

export default function ReportsTab() {
  const { 
    stats, 
    bookings, 
    hotels, 
    rooms, 
    getMonthlyRevenueData, 
    getOccupancyData, 
    getPageViewsData, 
    getRoomBookings, 
    getRoomRevenue,
    CHART_COLORS
  } = useOutletContext();

  const occupancyData = getOccupancyData() || [];
  const revenueData = getMonthlyRevenueData() || [];

  const handleExport = () => {
    const formatDate = (dateStr) => {
      try {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toISOString().split('T')[0];
      } catch (e) { return 'N/A'; }
    };

    const formatDateTime = (dateStr) => {
      try {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toISOString().replace('T', ' ').split('.')[0];
      } catch (e) { return 'N/A'; }
    };

    const exportData = bookings.map(b => ({
      'Booking ID': b._id,
      'Guest Name': b.userId?.name || 'N/A',
      'Hotel': b.hotelId?.name || 'N/A',
      'Room': b.roomId?.title || 'N/A',
      'Check-in': formatDate(b.checkIn),
      'Check-out': formatDate(b.checkOut),
      'Amount': b.totalAmount,
      'Status': b.bookingStatus,
      'Payment': b.paymentStatus,
      'Booked On': formatDateTime(b.createdAt)
    }));
    
    exportToCSV(exportData, 'Admin_Revenue_Report');
  };

  return (
    <div className="reports-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-premium">
        <div className="header-titles">
          <h2>Platform Insights</h2>
          <p className="subtitle-admin">Deep dive into your system's performance and revenue.</p>
        </div>
        <button 
          onClick={handleExport}
          className="export-btn-premium"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'var(--primary-gradient)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Download size={20} />
          Export Revenue
        </button>
      </div>
      
      <div className="revenue-summary-premium">
        <div className="revenue-card-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.1s both' }}>
          <div className="card-icon-modern" style={{ background: 'var(--primary-gradient)' }}>
            <Briefcase size={28} />
          </div>
          <div className="card-info">
            <span className="info-label">Platform Revenue</span>
            <p className="amount">₹{stats?.revenue?.toLocaleString() || 0}</p>
            <div className="stat-meta">
              <span className="trend-up">↑ 12%</span>
              <span className="meta-text">from last month</span>
            </div>
          </div>
        </div>
        
        <div className="revenue-card-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.2s both' }}>
          <div className="card-icon-modern" style={{ background: 'var(--success-gradient)' }}>
            <Hotel size={28} />
          </div>
          <div className="card-info">
            <span className="info-label">Market Share</span>
            <p className="amount">₹{hotels.length > 0 ? (stats?.revenue / hotels.length).toFixed(0).toLocaleString() : 0}</p>
            <div className="stat-meta">
              <span className="meta-text">Avg / Property</span>
            </div>
          </div>
        </div>

        <div className="revenue-card-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.3s both' }}>
          <div className="card-icon-modern" style={{ background: 'var(--accent-gradient)' }}>
            <Calendar size={28} />
          </div>
          <div className="card-info">
            <span className="info-label">Active Bookings</span>
            <p className="amount">{bookings.filter(b => new Date(b.checkOut) >= new Date()).length}</p>
            <div className="stat-meta">
              <span className="meta-text">Real-time status</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-charts-grid">
        <div className="admin-chart-container" style={{ animation: 'fadeInScale 0.6s ease-out 0.4s both' }}>
          <div className="chart-header">
            <h3>Revenue Growth</h3>
            <p>Monthly overview for {new Date().getFullYear()}</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminColorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5}/>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `₹${value/1000}k`} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                />
                <RechartsTooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ fontWeight: 600, color: '#0f172a' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#adminColorRevenue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-chart-container" style={{ animation: 'fadeInScale 0.6s ease-out 0.5s both' }}>
          <div className="chart-header">
            <h3>Occupancy Breakdown</h3>
            <p>Live resource utilization per hotel</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={occupancyData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5}/>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                  dy={15}
                  dx={-5}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  domain={[0, 100]} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  formatter={(value) => [`${value}%`, 'Occupancy']} 
                />
                <Bar 
                  dataKey="occupancyRate" 
                  radius={[10, 10, 0, 0]} 
                  maxBarSize={48}
                  animationDuration={1500}
                >
                   {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.occupancyRate > 70 ? '#10b981' : entry.occupancyRate > 40 ? '#3b82f6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="booking-breakdown-section" style={{ animation: 'fadeInScale 0.6s ease-out 0.6s both' }}>
        <div className="section-header-modern">
          <div className="header-info">
            <h3>Revenue per Room</h3>
            <p>Detailed performance metrics for local inventory.</p>
          </div>
          <span className="count-pill">{rooms.length} Units</span>
        </div>
        
        <div className="admin-table-wrapper-premium">
          <table className="admin-table-modern">
            <thead>
              <tr>
                <th>Inventory Unit</th>
                <th>Category</th>
                <th>Volume</th>
                <th>Net Revenue</th>
                <th>Yield</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, idx) => {
                const roomBookingsCount = getRoomBookings(room._id).length;
                const roomRevenueValue = getRoomRevenue(room._id);
                const avgPerBooking = roomBookingsCount > 0 ? roomRevenueValue / roomBookingsCount : 0;
                
                return (
                  <tr key={room._id} style={{ animation: `slideInRight 0.4s ease-out ${0.1 * idx}s both` }}>
                    <td className="room-cell">
                      <div className="room-info-box">
                        <span className="room-name">{room.title}</span>
                        <span className="hotel-sub">{room.hotelId?.name}</span>
                      </div>
                    </td>
                    <td><span className={`badge-premium ${room.roomType}`}>{room.roomType}</span></td>
                    <td>
                      <div className="booking-volume">
                        <span className="main-v">{roomBookingsCount}</span>
                        <span className="v-label">bookings</span>
                      </div>
                    </td>
                    <td className="revenue-cell-premium">₹{roomRevenueValue.toLocaleString()}</td>
                    <td>
                      <div className="yield-box">
                        <span className="yield-val">₹{avgPerBooking.toFixed(0).toLocaleString()}</span>
                        <span className="yield-label">/ booking</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
