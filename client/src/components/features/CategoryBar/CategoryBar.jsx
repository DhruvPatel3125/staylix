import React from 'react';
import { Star, Compass, Hotel, Shield, Palmtree, Briefcase, Gem, Waves } from 'lucide-react';
import './CategoryBar.css';

const CATEGORIES = [
  { id: 'luxury', label: 'Luxurious', icon: <Gem size={24} />, description: 'High-end stays' },
  { id: 'resort', label: 'Beach Resort', icon: <Waves size={24} />, description: 'Coastal getaways' },
  { id: 'boutique', label: 'Boutique', icon: <Hotel size={24} />, description: 'Unique experiences' },
  { id: 'business', label: 'Business', icon: <Briefcase size={24} />, description: 'Corporate travel' },
];

export default function CategoryBar({ activeCategories, onCategoryToggle }) {
  return (
    <div className="category-bar-wrapper">
      <div className="category-bar-container">
        {CATEGORIES.map((category) => {
          const isActive = activeCategories.includes(category.id);
          return (
            <button
              key={category.id}
              className={`category-item ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryToggle(category.id)}
              type="button"
            >
              <div className="category-icon-wrapper">
                {category.icon}
              </div>
              <div className="category-info">
                <span className="category-label">{category.label}</span>
                <span className="category-description">{category.description}</span>
              </div>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
