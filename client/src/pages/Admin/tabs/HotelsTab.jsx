import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Search, MapPin, Star, Trash2, Users, ArrowRight, Hotel as Building, 
  X, Globe, Mail, Check, Layers, Info, Layout
} from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';

export default function HotelsTab() {
  const { 
    hotels, 
    searchTerm, 
    setSearchTerm, 
    handleDeleteHotel, 
    processingId,
    rooms 
  } = useOutletContext();

  const [selectedHotel, setSelectedHotel] = React.useState(null);

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
                        onClick={() => setSelectedHotel(hotel)}
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

      {/* Hotel Profile Modal */}
      {selectedHotel && (
        <div className="hotel-profile-modal-overlay" onClick={() => setSelectedHotel(null)}>
          <div className="hotel-profile-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedHotel(null)}>
              <X size={24} />
            </button>
            
            <div className="hotel-profile-content">
              <div className="hotel-modal-header">
                <img 
                  src={selectedHotel.photos?.[0] ? getImageUrl(selectedHotel.photos[0]) : "https://images.unsplash.com/photo-1542314831-c6a4d14b423c?fit=crop&w=1200&q=80"} 
                  alt={selectedHotel.name}
                  className="hotel-modal-image-main" 
                />
                <div className="hotel-header-overlay">
                  <div className="hotel-header-info">
                    <h2>{selectedHotel.name}</h2>
                    <div className="hotel-header-meta">
                      <div className="meta-item">
                        <MapPin size={18} />
                        <span>{selectedHotel.address?.city}, {selectedHotel.address?.state}</span>
                      </div>
                      <div className="meta-item">
                        <Star size={18} fill="#fbaf24" stroke="#fbaf24" />
                        <span>{selectedHotel.rating || 'N/A'} ({selectedHotel.numReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <span className={`status-pill-modern ${selectedHotel.isActive !== false ? 'active' : 'blocked'}`}>
                    {selectedHotel.isActive !== false ? 'Active Property' : 'Hidden Property'}
                  </span>
                </div>
              </div>

              <div className="hotel-modal-body">
                <div className="main-info-column">
                  <div className="info-section-premium">
                    <span className="section-label-modern">Our Story & Vision</span>
                    <p className="hotel-description-full">
                      {selectedHotel.description || "No description provided for this luxury property."}
                    </p>
                  </div>

                  <div className="info-section-premium">
                    <span className="section-label-modern">Premium Amenities</span>
                    <div className="amenities-grid-premium">
                      {selectedHotel.amenities?.length > 0 ? selectedHotel.amenities.map((amenity, i) => (
                        <div key={i} className="amenity-item-modern">
                          <Check size={16} />
                          <span>{amenity}</span>
                        </div>
                      )) : <p>Standard luxury amenities included.</p>}
                    </div>
                  </div>

                  {selectedHotel.photos?.length > 1 && (
                    <div className="info-section-premium">
                      <span className="section-label-modern">Visual Gallery</span>
                      <div className="gallery-grid-modern">
                        {selectedHotel.photos.slice(1).map((photo, i) => (
                          <div key={i} className="gallery-image-wrapper">
                            <img src={getImageUrl(photo)} alt={`Gallery ${i}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sidebar-sticky-modern">
                  <div className="owner-info-card-premium">
                    <span className="section-label-modern">Property Ownership</span>
                    <div className="owner-profile-preview">
                      <div className="owner-avatar-large">
                        {selectedHotel.ownerId?.name?.[0]?.toUpperCase() || 'O'}
                      </div>
                      <div className="owner-name-stack">
                        <h4>{selectedHotel.ownerId?.name || 'Assigned Owner'}</h4>
                        <span className="owner-email-muted">{selectedHotel.ownerId?.email}</span>
                      </div>
                    </div>
                    <button className="nav-item active" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                      <Mail size={18} /> Contact Owner
                    </button>
                  </div>

                  <div className="location-full-box">
                    <span className="section-label-modern">Location Details</span>
                    <p className="location-address-text">
                      {selectedHotel.address?.addressLine}<br />
                      {selectedHotel.address?.city}, {selectedHotel.address?.state}<br />
                      {selectedHotel.address?.country} - {selectedHotel.address?.pincode}
                    </p>
                    <div className="stats-ring-compact">
                      <div className="stat-ring-item">
                        <Layers size={20} color="#6366f1" />
                        <span className="info-label-mini">Inventory</span>
                        <strong>{rooms.filter(r => (r.hotelId?._id || r.hotelId)?.toString() === selectedHotel._id?.toString()).length} Units</strong>
                      </div>
                      <div className="stat-ring-item">
                        <Users size={20} color="#10b981" />
                        <span className="info-label-mini">Capacity</span>
                        <strong>{rooms.filter(r => (r.hotelId?._id || r.hotelId)?.toString() === selectedHotel._id?.toString()).reduce((sum, r) => sum + (r.guestCapacity || 0), 0)}+ Pax</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inventory-summary-modal">
                <span className="section-label-modern">Room Inventory Overview</span>
                <div className="room-cards-lite">
                   {rooms.filter(r => (r.hotelId?._id || r.hotelId)?.toString() === selectedHotel._id?.toString()).map((room, i) => (
                     <div key={i} className="room-card-lite">
                       <div className="room-type-icon-box">
                         <Layout size={20} />
                       </div>
                       <div className="room-lite-info">
                         <span className="hotel-name-bold">{room.title}</span>
                         <div className="meta-item">
                            <span className="badge-premium standard" style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem' }}>{room.roomType}</span>
                            <span className="price-val" style={{ fontWeight: 700, marginLeft: '0.5rem' }}>₹{room.pricePerNight}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
