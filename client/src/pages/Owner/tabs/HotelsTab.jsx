import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, MapPin, Trash2, Edit3, X, Camera } from 'lucide-react';

export default function HotelsTab() {
  const { 
    hotels,
    rooms,
    showHotelForm,
    setShowHotelForm,
    editingHotel,
    formData,
    setFormData,
    photoFileNames,
    setPhotoFileNames,
    processingId,
    handleAddHotel,
    handleEditHotel,
    handleSaveHotel,
    handleDeleteHotel,
    getImageUrl
  } = useOutletContext();

  const handleRemovePhoto = (indexToRemove) => {
    // 1. Remove from the actual File objects array (formData.photos)
    const newPhotos = [...formData.photos];
    newPhotos.splice(indexToRemove, 1);
    setFormData({ ...formData, photos: newPhotos });

    // 2. Remove the name from the photoFileNames display array
    const newNames = [...photoFileNames];
    newNames.splice(indexToRemove, 1);
    setPhotoFileNames(newNames);
  };

  return (
    <div className="hotels-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header">
        <h2>My Hotels</h2>
        <button className="add-btn" onClick={handleAddHotel}>
          <Plus size={20} /> Add New Hotel
        </button>
      </div>

      {showHotelForm && (
        <div className="hotel-form-container">
          <h3>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h3>
          <div className="form-group">
            <label>Hotel Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grand Plaza Hotel"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country *</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Country"
              />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Pincode"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell guests about your hotel..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Photos</label>
            <div className="photo-upload-wrapper">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  // Append new files to existing files instead of replacing everything
                  const newPhotosArray = [...(formData.photos || []), ...files];
                  setFormData({ ...formData, photos: newPhotosArray });
                  setPhotoFileNames(newPhotosArray.map(f => f.name));
                }}
                id="hotel-photos"
                className="hidden-input"
              />
              <label htmlFor="hotel-photos" className="photo-upload-label">
                <Camera size={24} />
                <span>Select Photos</span>
              </label>
            </div>
            {photoFileNames.length > 0 && (
              <div className="photos-preview-gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {photoFileNames.map((name, i) => {
                  // If it's a File object (new upload), generate a local object URL
                  const fileObj = formData.photos && formData.photos[i];
                  const isFile = fileObj instanceof File;
                  const previewUrl = isFile ? URL.createObjectURL(fileObj) : (editingHotel?.photos?.[i] ? getImageUrl(editingHotel.photos[i]) : null);

                  return (
                    <div key={i} className="photo-preview-item" style={{ position: 'relative', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #edf2f7' }}>
                      {previewUrl ? (
                         <img src={previewUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                         <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontSize: '0.8rem', color: '#64748b' }}>{name}</div>
                      )}
                      <button 
                        onClick={() => handleRemovePhoto(i)}
                        title="Remove photo"
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {editingHotel && photoFileNames.length === 0 && (
              <p className="helper-text">Leave empty to keep existing photos</p>
            )}
          </div>

          <div className="form-group">
            <label>Amenities (comma-separated)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="WiFi, Parking, Pool, Gym, etc."
            />
          </div>

          <div className="form-actions">
            <button
              className="save-btn"
              onClick={handleSaveHotel}
              disabled={processingId}
            >
              {processingId ? 'Saving...' : 'Save Hotel'}
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowHotelForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {hotels.length === 0 ? (
        <div className="empty-state">
          <p>No hotels yet</p>
          <p className="empty-text">Create your first hotel to get started</p>
        </div>
      ) : (
        <div className="hotels-list">
          {hotels.map(hotel => (
            <div key={hotel._id} className="hotel-card">
              {hotel.photos && hotel.photos.length > 0 && (
                <div className="hotel-image">
                  <img src={getImageUrl(hotel.photos[0])} alt={hotel.name} />
                </div>
              )}
              <div className="hotel-info">
                <h3>{hotel.name}</h3>
                <p className="location">
                  <MapPin size={16} /> {hotel.address?.city || hotel.city || 'Location N/A'}, {hotel.address?.state || hotel.state || ''}
                </p>
                {hotel.description && (
                  <p className="description">{hotel.description}</p>
                )}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="amenities">
                    {hotel.amenities.map((amenity, idx) => (
                      <span key={idx} className="amenity-badge">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
                <div className="hotel-stats">
                  <span>🛏️ {rooms.filter(r => (r.hotelId?._id || r.hotelId) === hotel._id).length} rooms</span>
                </div>
              </div>
              <div className="hotel-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditHotel(hotel)}
                >
                  <Edit3 size={16} /> Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteHotel(hotel._id)}
                  disabled={processingId === hotel._id}
                >
                  {processingId === hotel._id ? '...' : <><Trash2 size={16} /> Delete</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
