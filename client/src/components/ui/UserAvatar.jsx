import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import { User as UserIcon } from 'lucide-react';
import './UserAvatar.css';

const UserAvatar = ({ user, size = 'medium', className = '', fallbackInitial = true }) => {
  const [imageError, setImageError] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  useEffect(() => {
    if (user?.profileImage) {
      setImgUrl(getImageUrl(user.profileImage));
      setImageError(false);
    } else {
      setImgUrl('');
    }
  }, [user?.profileImage]);

  const handleImageError = () => {
    console.error('Failed to load profile image:', imgUrl);
    setImageError(true);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const renderFallback = () => {
    if (fallbackInitial && user?.name) {
      return <span>{getInitials(user.name)}</span>;
    }
    return <UserIcon size={size === 'large' ? 40 : 20} />;
  };

  const avatarClasses = `user-avatar-component ${size}-avatar role-${user?.role || 'guest'} ${className}`;

  return (
    <div className={avatarClasses}>
      {!imageError && imgUrl ? (
        <img 
          src={imgUrl} 
          alt={user?.name || 'User Avatar'} 
          onError={handleImageError}
          className="avatar-img"
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
};

export default UserAvatar;
