import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, MapPin, Star, Trash2, Users, ArrowRight, Hotel as Building } from 'lucide-react';

export default function HotelsTab() {
  const { 
    hotels, 
    searchTerm, 
    setSearchTerm, 
    handleDeleteHotel, 
    processingId 
  } = useOutletContext();

  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hotels-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-modern">
        <div className="header-info">
          <h2>Property Directory</h2>
          <p className="subtitle-admin">Monitor and manage all hotel properties listed on the platform.</p>
        </div>
        <div className="search-wrapper">
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-premium"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredHotels.length === 0 ? (
        <div className="empty-state-premium">
          <p>{searchTerm ? 'No results found' : 'No properties registered'}</p>
        </div>
      ) : (
        <div className="admin-table-wrapper-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.2s both' }}>
          <table className="admin-table-modern">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Performance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map((hotel, idx) => (
                <tr key={hotel._id} style={{ animation: `slideInRight 0.4s ease-out ${0.05 * idx}s both` }}>
                  <td>
                    <div className="property-cell">
                      <div className="property-img-placeholder">
                         <Building size={20} />
                      </div>
                      <div className="property-info-stack">
                        <span className="hotel-name-bold">{hotel.name}</span>
                        <span className={`status-text ${hotel.isActive !== false ? 'active' : 'inactive'}`}>
                          {hotel.isActive !== false ? '● Live' : '○ Hidden'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="location-cell">
                      <MapPin size={14} />
                      <span>{hotel.address?.city || hotel.city || 'N/A'}, {hotel.address?.state || hotel.state || ''}</span>
                    </div>
                  </td>
                  <td>
                    <div className="owner-cell">
                      <span>{hotel.ownerId?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="rating-yield">
                      <div className="stars">
                         <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                         <span>{hotel.rating || 'N/A'}</span>
                      </div>
                      <span className="review-v">({hotel.numReviews || 0} reviews)</span>
                    </div>
                  </td>
                  <td>
                    <div className="compact-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="action-btn-circle"
                        title="View Full Profile"
                      >
                         <ArrowRight size={18} />
                      </button>
                      <button
                        className="action-btn-circle delete"
                        onClick={() => handleDeleteHotel(hotel._id)}
                        disabled={processingId === hotel._id}
                        title="Delete Property"
                      >
                        {processingId === hotel._id ? '...' : <Trash2 size={18} />}
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
