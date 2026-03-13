import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';

export default function RoomsTab() {
  const { 
    rooms, 
    searchTerm, 
    setSearchTerm, 
    handleDeleteRoom, 
    processingId 
  } = useOutletContext();

  const filteredRooms = rooms.filter(room =>
    room.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rooms-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-modern">
        <div className="header-info">
          <h2>Inventory Management</h2>
          <p className="subtitle-admin">Track room availability and pricing across the entire platform.</p>
        </div>
        <div className="search-wrapper">
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-premium"
            placeholder="Search inventory units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="empty-state-premium">
          <p>{searchTerm ? 'No matches found' : 'No rooms available'}</p>
        </div>
      ) : (
        <div className="admin-table-wrapper-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.2s both' }}>
          <table className="admin-table-modern">
            <thead>
              <tr>
                <th>Inventory Unit</th>
                <th>Category</th>
                <th>Tariff</th>
                <th>Availability</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room, idx) => (
                <tr key={room._id} style={{ animation: `slideInRight 0.4s ease-out ${0.05 * idx}s both` }}>
                  <td>
                    <div className="room-info-cell">
                      <span className="room-title-premium">{room.title}</span>
                      <span className="room-hotel-muted">{room.hotelId?.name}</span>
                    </div>
                  </td>
                  <td><span className={`badge-premium ${room.roomType}`}>{room.roomType}</span></td>
                  <td>
                    <div className="price-stack">
                      <span className="p-val">₹{room.pricePerNight}</span>
                      <span className="p-unit">/ night</span>
                    </div>
                  </td>
                  <td>
                    <div className="inventory-stat">
                      <div className="inv-bar">
                        <div 
                          className="inv-fill" 
                          style={{ width: `${(room.availableRooms / room.totalRooms) * 100}%` }}
                        ></div>
                      </div>
                      <span className="inv-text">{room.availableRooms} / {room.totalRooms} available</span>
                    </div>
                  </td>
                  <td>
                    <div className="compact-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="action-btn-circle delete"
                        onClick={() => handleDeleteRoom(room._id)}
                        disabled={processingId === room._id}
                        title="Delete Inventory Unit"
                      >
                        {processingId === room._id ? '...' : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
