import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Чиним стандартные иконки Leaflet
const customMarker = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MapView({ spots, onEditClick }) {
  // Фильтруем только те заведения, у которых есть координаты
  const spotsWithCoords = spots.filter(spot => spot.lat && spot.lng);

  return (
    <div className="map-container-wrapper">
      <MapContainer center={[50.4501, 30.5234]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {spotsWithCoords.map(spot => (
          <Marker key={spot._id} position={[spot.lat, spot.lng]} icon={customMarker}>
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#58a6ff' }}>{spot.name}</h3>
                <p style={{ margin: '0 0 10px 0' }}>{'⭐️'.repeat(spot.rating)}</p>
                {spot.imageUrl && (
                  <img 
                    src={spot.imageUrl} 
                    alt={spot.name} 
                    style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} 
                  />
                )}
                <button 
                  onClick={() => onEditClick(spot)} 
                  style={{ background: '#238636', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                >
                  Редактировать
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}