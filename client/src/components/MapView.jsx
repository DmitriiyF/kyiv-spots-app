import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Железобетонные ссылки на иконки (используем стабильный CDN)
const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView({ spots, onEditClick, isAdmin }) {
  // Фильтруем заведения, у которых ТОЧНО есть валидные числа в координатах
  const spotsWithCoords = spots.filter(spot => 
    spot && 
    spot.lat && spot.lng && 
    !isNaN(parseFloat(spot.lat)) && 
    !isNaN(parseFloat(spot.lng))
  );

  // 🛡 ЕСЛИ КООРДИНАТ НЕТ НИ У КОГО — показываем понятное сообщение вместо пустой карты
  if (spotsWithCoords.length === 0) {
    return (
      <div className="map-container-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161b22', color: '#8b949e', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '40px' }}>🗺</span>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#c9d1d9' }}>На карте пока пусто</p>
        <p style={{ margin: 0, fontSize: '14px' }}>У твоих заведений в базе нет координат.</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#58a6ff' }}>Нажми ✏️ на карточке в режиме "Списком", вставь ссылку Google Maps и сохрани!</p>
      </div>
    );
  }

  // Центрируем карту по первому заведению из списка
  const centerLat = parseFloat(spotsWithCoords[0].lat);
  const centerLng = parseFloat(spotsWithCoords[0].lng);

  return (
    <div className="map-container-wrapper">
      <MapContainer 
        key={spotsWithCoords.length} 
        center={[centerLat, centerLng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {spotsWithCoords.map(spot => (
          <Marker 
            key={spot._id} 
            position={[parseFloat(spot.lat), parseFloat(spot.lng)]} 
            icon={markerIcon} 
          >
            <Popup>
              <div style={{ textAlign: 'center', color: '#c9d1d9' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#58a6ff' }}>{spot.name}</h3>
                <p style={{ margin: '0 0 10px 0' }}>{'⭐️'.repeat(spot.rating)}</p>
                {spot.imageUrl && (
                  <img 
                    src={spot.imageUrl} 
                    alt={spot.name} 
                    style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} 
                  />
                )}
                {/* 🔐 КНОПКА РЕДАКТИРОВАНИЯ ТОЛЬКО ДЛЯ АДМИНА */}
                {isAdmin && (
                  <button 
                    onClick={() => onEditClick(spot)} 
                    style={{ background: '#238636', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                  >
                    Редактировать
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}