import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download } from 'lucide-react';
import { exportToCSV } from '../../../utils/csvExport';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';

export default function OverviewTab() {
  const { 
    bookings, 
    rooms, 
    hotels,
    getMonthlyRevenueData,
    getOccupancyData,
    getPageViewsData,
    getRoomRevenue,
    getRoomBookings,
    COLORS
  } = useOutletContext();

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
    
    exportToCSV(exportData, 'Owner_Revenue_Report');
  };

  const activeBookingsCount = bookings.filter(b => b.bookingStatus !== 'cancelled').length;
  const totalRevenue = bookings
    .filter(b => b.bookingStatus !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="revenue-section analytics-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Analytics & Reports</h2>
        <button 
          onClick={handleExport}
          className="export-btn-owner"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(102, 126, 234, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Download size={18} />
          Export Revenue
        </button>
      </div>
      
      <div className="revenue-summary" style={{ marginBottom: '2rem' }}>
        <div className="revenue-card">
          <h3>Total Revenue</h3>
          <p className="revenue-amount">₹{totalRevenue.toFixed(2)}</p>
          <p className="revenue-info">From {activeBookingsCount} bookings</p>
        </div>
        <div className="revenue-card">
          <h3>Average Per Room</h3>
          <p className="revenue-amount">₹{rooms.length > 0 ? (totalRevenue / rooms.length).toFixed(2) : 0}</p>
          <p className="revenue-info">Across {rooms.length} rooms</p>
        </div>
        <div className="revenue-card">
          <h3>Active Bookings</h3>
          <p className="revenue-amount">{bookings.filter(b => new Date(b.checkOut) >= new Date() && b.bookingStatus !== 'cancelled').length}</p>
          <p className="revenue-info">Ongoing bookings</p>
        </div>
      </div>

      <div className="charts-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
        marginTop: '1.5rem'
      }}>
        {/* Monthly Revenue Chart */}
        <div className="chart-container" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem' }}>Monthly Revenue ({new Date().getFullYear()})</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={getMonthlyRevenueData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip formatter={(value) => [`₹${value.toFixed(0)}`, 'Revenue']} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Rate Chart */}
        <div className="chart-container" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem' }}>Occupancy Rates (%)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={getOccupancyData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip formatter={(value) => [`${value}%`, 'Occupancy']} cursor={{fill: 'rgba(72, 187, 120, 0.1)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="occupancyRate" fill="#48bb78" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Page Views Chart */}
        <div className="chart-container" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem' }}>Hotel Page Views</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={getPageViewsData()} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0"/>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip formatter={(value) => [value, 'Views']} cursor={{fill: 'rgba(246, 173, 85, 0.1)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="views" fill="#f6ad55" radius={[0, 6, 6, 0]} barSize={25}>
                  {getPageViewsData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h3>Breakdown by Rooms</h3>
      {rooms.length === 0 ? (
        <div className="empty-state">
          <p>No rooms to report</p>
        </div>
      ) : (
        <div className="rooms-revenue-table">
          <table>
            <thead>
              <tr>
                <th>Room Title</th>
                <th>Type</th>
                <th>Price/Night</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Avg Per Booking</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => {
                const roomBookings = getRoomBookings(room._id);
                const roomRevenue = getRoomRevenue(room._id);
                const avgPerBooking = roomBookings.length > 0 ? roomRevenue / roomBookings.length : 0;
                
                return (
                  <tr key={room._id}>
                    <td><strong>{room.title}</strong></td>
                    <td>{room.roomType}</td>
                    <td>₹{room.pricePerNight}</td>
                    <td>{roomBookings.length}</td>
                    <td className="revenue">₹{roomRevenue.toFixed(2)}</td>
                    <td className="revenue">₹{avgPerBooking.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
