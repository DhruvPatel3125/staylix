import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../../utils/imageUrl';
import OptimizedImage from '../../common/OptimizedImage';
import './MapView.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to auto-fit map bounds based on markers
function ChangeView({ hotels }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (hotels.length > 0) {
      const bounds = L.latLngBounds(hotels.map(h => [
        h.location?.coordinates[1] || 0,
        h.location?.coordinates[0] || 0
      ]).filter(coord => coord[0] !== 0 || coord[1] !== 0));
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [hotels, map]);
  
  return null;
}

export default function MapView({ hotels }) {
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  
  return (
    <div className="map-view-container">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        className="leaflet-map-main"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView hotels={hotels} />
        
        {hotels.map((hotel) => {
          const lat = hotel.location?.coordinates[1];
          const lng = hotel.location?.coordinates[0];
          
          if (!lat || !lng || (lat === 0 && lng === 0)) return null;
          
          return (
            <Marker key={hotel._id} position={[lat, lng]}>
              <Popup className="premium-map-popup">
                <div className="popup-card">
                  <div className="popup-image">
                    <OptimizedImage 
                      src={hotel.photos?.[0] ? getImageUrl(hotel.photos[0]) : ''} 
                      alt={hotel.name} 
                    />
                    <div className="popup-rating">
                      <Star size={12} fill="currentColor" />
                      <span>{hotel.rating || 0}</span>
                    </div>
                  </div>
                  <div className="popup-details">
                    <h4>{hotel.name}</h4>
                    <p className="popup-location">
                      <MapPin size={12} />
                      <span>{hotel.address?.city}</span>
                    </p>
                    <Link to={`/hotel/${hotel._id}`} className="popup-link">
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
