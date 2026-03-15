import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Bed, Trash2, Edit3, Camera, X } from 'lucide-react';

export default function RoomsTab() {
  const { 
    hotels,
    rooms,
    searchTerm,
    setSearchTerm,
    showRoomForm,
    setShowRoomForm,
    roomFormData,
    setRoomFormData,
    roomImageFileName,
    setRoomImageFileName,
    editingRoom,
    processingId,
    handleAddRoom,
    handleEditRoom,
    handleSaveRoom,
    handleDeleteRoom,
    handleToggleRoomAvailability,
    getRoomBookings,
    getImageUrl
  } = useOutletContext();

  const filteredRooms = rooms.filter(room =>
    room.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rooms-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header">
        <h2><Bed size={24} /> My Rooms</h2>
        <button className="add-btn" onClick={handleAddRoom}>
          <Plus size={20} /> Add New Room
        </button>
      </div>

      {showRoomForm && (
        <div className="room-form-container">
          <h3>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Hotel *</label>
              <select
                value={roomFormData.hotelId}
                onChange={(e) => setRoomFormData({ ...roomFormData, hotelId: e.target.value })}
              >
                <option value="">Select Hotel</option>
                {hotels.map(h => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Room Title *</label>
              <input
                type="text"
                value={roomFormData.title}
                onChange={(e) => setRoomFormData({ ...roomFormData, title: e.target.value })}
                placeholder="e.g., Deluxe Room 101"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Room Type *</label>
              <select
                value={roomFormData.roomType}
                onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price Per Night (₹) *</label>
              <input
                type="number"
                value={roomFormData.pricePerNight}
                onChange={(e) => setRoomFormData({ ...roomFormData, pricePerNight: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Guest Capacity *</label>
              <input
                type="number"
                value={roomFormData.guestCapacity}
                onChange={(e) => setRoomFormData({ ...roomFormData, guestCapacity: e.target.value })}
                placeholder="2"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Amenities (comma-separated)</label>
            <input
              type="text"
              value={roomFormData.amenities}
              onChange={(e) => setRoomFormData({ ...roomFormData, amenities: e.target.value })}
              placeholder="WiFi, AC, TV, Bathroom, etc."
            />
          </div>

          <div className="form-group">
            <label>Room Image</label>
            <div className="photo-upload-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setRoomFormData({ ...roomFormData, image: file });
                    setRoomImageFileName(file.name);
                  }
                }}
                id="room-photo"
                className="hidden-input"
              />
              <label htmlFor="room-photo" className="photo-upload-label">
                <Camera size={24} />
                <span>Select Photo</span>
              </label>
            </div>
            {roomImageFileName && (
              <div className="photos-preview-gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="photo-preview-item" style={{ position: 'relative', height: '100px', width: '150px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #edf2f7' }}>
                  {(() => {
                    const isFile = roomFormData.image instanceof File;
                    const previewUrl = isFile ? URL.createObjectURL(roomFormData.image) : (editingRoom?.image ? getImageUrl(editingRoom.image) : null);
                    
                    return previewUrl ? (
                      <img src={previewUrl} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '0.5rem' }}>{roomImageFileName}</div>
                    );
                  })()}
                  <button 
                    onClick={() => {
                      setRoomFormData({ ...roomFormData, image: null });
                      setRoomImageFileName('');
                    }}
                    title="Remove photo"
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                  >
                    <X size={14} style={{margin: 'auto'}} />
                  </button>
                </div>
              </div>
            )}
            {editingRoom && !roomImageFileName && (
               <p className="helper-text" style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b'}}>Leave empty to keep existing photo</p>
            )}
          </div>

          <div className="form-actions">
            <button
              className="save-btn"
              onClick={handleSaveRoom}
              disabled={processingId}
            >
              {processingId ? 'Saving...' : 'Save Room'}
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowRoomForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rooms-search">
        <input
          type="text"
          placeholder="Search rooms by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredRooms.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? 'No rooms found' : 'No rooms yet'}</p>
          <p className="empty-text">Add your first room to get started</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map(room => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const roomBookings = getRoomBookings(room._id);
            const occupiedToday = roomBookings.filter(b => {
              if (b.bookingStatus === 'cancelled') return false;
              const checkIn = new Date(b.checkIn);
              const checkOut = new Date(b.checkOut);
              return today >= checkIn && today < checkOut;
            }).length;

            return (
              <div key={room._id} className="room-card">
                {room.image && (
                  <div className="room-image-container">
                    <img src={getImageUrl(room.image)} alt={room.title} className="room-image" />
                  </div>
                )}
                <div className="room-content">
                  <div className="room-header">
                    <h3>{room.title}</h3>
                    <span className={`availability-badge ${room.isAvailable ? 'available' : 'unavailable'}`}>
                      {room.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="room-info">
                    <p><strong>Hotel:</strong> {room.hotelId?.name}</p>
                    <p><strong>Type:</strong> {room.roomType}</p>
                    <p><strong>Price:</strong> ₹{room.pricePerNight}/night</p>
                    <p><strong>Capacity:</strong> {room.guestCapacity} Guests</p>
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="room-amenities">
                        {room.amenities.map((amenity, idx) => (
                          <span key={idx} className="amenity-tag">{amenity}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="room-actions">
                  <button
                    className={`action-btn ${room.isAvailable ? 'block-btn' : 'unblock-btn'}`}
                    onClick={() => handleToggleRoomAvailability(room._id)}
                    disabled={processingId === room._id}
                  >
                    {processingId === room._id ? '...' : (room.isAvailable ? 'Deactivate' : 'Activate')}
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditRoom(room)}
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteRoom(room._id)}
                    disabled={processingId === room._id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
