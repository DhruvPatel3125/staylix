import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Camera,
  Check 
} from 'lucide-react';
import { showToast } from '../../../utils/swal';
import api from '../../../services/api';
import { getImageUrl } from '../../../utils/imageUrl';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import './ProfileTab.css';

export default function ProfileTab() {
  const { user, setUserContext } = useOutletContext(); // Assume parent updates context
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    profileImage: null
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      profileImage: null
    });
    setPreview('');
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('Image must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updateData = new FormData();
    updateData.append('name', formData.name.trim());

    if (formData.profileImage) {
      updateData.append('profileImage', formData.profileImage);
    }

    try {
      const response = await api.users.updateProfile(updateData);
      
      if (response.success) {
        showToast.success(response.message);
        
        // Update local state/context
        setUserContext?.(response.user);
        
        setIsEditing(false);
        setPreview('');
      }
    } catch (error) {
      const msg = error.message || 'Update failed';
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({ name: user?.name || '', profileImage: null });
    setPreview('');
  };

  if (!user) return <div className="empty-state">Loading profile...</div>;

  return (
    <div className="profile-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      {/* ── Header: avatar + name/role ── */}
      <div className="profile-header-premium">
        <div className="profile-avatar-wrapper">
          <div className={`profile-avatar-large ${user.role}-avatar`}>
            {preview || user.profileImage ? (
              <img
                src={preview || getImageUrl(user.profileImage)}
                alt="Profile"
              />
            ) : (
              <span>{formData.name.charAt(0)?.toUpperCase()}</span>
            )}
          </div>

          {/* Change photo button — only visible in edit mode */}
          {isEditing && (
            <label className="avatar-change-btn" title="Change photo">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <Camera size={16} />
            </label>
          )}
        </div>

        <div className="profile-title-info">
          <h2>{isEditing ? 'Edit Profile' : 'Profile Information'}</h2>
          <p className="profile-role-text">{user.role?.toUpperCase()}</p>
          {isEditing && (
            <p className="profile-photo-hint">Click the camera icon to change photo</p>
          )}
        </div>
      </div>

      {/* ── Form fields ── */}
      <form onSubmit={handleSubmit} className="profile-edit-form">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          disabled={!isEditing}
          placeholder="Enter your full name"
        />

        <Input
          label="Email Address"
          value={user.email || 'N/A'}
          disabled
          icon={Mail}
        />

        {isEditing ? (
          <div className="profile-actions">
            <Button type="submit" loading={loading}>
              <Save size={18} /> Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={cancelEdit}
              disabled={loading}
            >
              <X size={18} /> Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{ width: '100%' }}
          >
            <Edit3 size={18} /> Edit Profile
          </Button>
        )}

        {/* ── Account role chip ── */}
        <div className="profile-status-card">
          <div className="detail-header">
            <Shield size={20} />
            <span>Account Role</span>
          </div>
          <span className={`role-badge-premium ${user.role}-badge`}>
            {user.role?.toUpperCase()}
          </span>
        </div>
      </form>
    </div>
  );
}

