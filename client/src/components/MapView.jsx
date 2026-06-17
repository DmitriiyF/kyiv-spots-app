import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// 🔥 Абсолютно пуленепробиваемый фикс дефолтных икон Leaflet для React + Vite.
// Мы принудительно переписываем пути к картинкам на стабильные CDN-ссылки глобально для всей библиотеки.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ spots, onEditClick }) {
  // Тщательно отбираем только заведения с валидными координатами
  const spotsWithCoords = spots.filter(spot => 
    spot && 
    spot.lat !== undefined && spot.lng !== undefined &&
    spot.lat !== null && spot.lng !== null &&
    spot.lat !== '' && spot.lng !== '' &&
    !isNaN(Number(spot.lat)) && !isNaN(Number(spot.lng))
  );

  return (
    <div className="map-container-wrapper">
      {/* 🔥 Главная React-магия: добавляем динамический атрибут key, зависящий от количества точек. 
        Поскольку Leaflet ленив и не умеет перерисовываться на лету при обновлении пропсов,
        изменение key заставит React полностью перемонтировать карту с чистого листа, 
        как только в базе появятся или изменятся координаты!
      */}
      <MapContainer 
        key={spotsWithCoords.length}
        center={[50.4501, 30.5234]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {spotsWithCoords.map(spot => (
          <Marker key={spot._id} position={[parseFloat(spot.lat), parseFloat(spot.lng)]}>
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