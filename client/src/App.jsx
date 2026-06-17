import { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView'; 
import 'leaflet/dist/leaflet.css'; 
import html2canvas from 'html2canvas'; // 📸 Наша новая магия для сторис

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://kyiv-spots-app.onrender.com';

const CATEGORIES = ['Все', 'Кофейня', 'Ресторан', 'Бар', 'Стрит-фуд', 'Парк / Локация'];
const PRICE_LEVELS = ['💸', '💸💸', '💸💸💸'];
const STATUSES = ['Без статуса', 'Уже был', 'Хочу сходить']; 

const initialFormState = {
  name: '', category: 'Кофейня', rating: 5, review: '', imageUrl: '', instagramUrl: '',
  location: '', googleMapsUrl: '', priceLevel: '💸', tags: '', status: 'Без статуса', lat: '', lng: ''
};

const extractCoords = (url) => {
  if (!url) return { lat: '', lng: '' };
  const matchAt = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const matchBang = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (matchAt) return { lat: matchAt[1], lng: matchAt[2] };
  if (matchBang) return { lat: matchBang[1], lng: matchBang[2] };
  return { lat: '', lng: '' };
};

function App() {
  const [spots, setSpots] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpotId, setEditingSpotId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); 
  
  // 📲 Стейт для генерации сторис
  const [storySpot, setStorySpot] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedRating, setSelectedRating] = useState('Все');
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const [sortBy, setSortBy] = useState('newest');

  const [formData, setFormData] = useState(initialFormState);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
    setLogs(prev => [{ time, message, type }, ...prev]);
  };

  const fetchSpots = async () => {
    addLog('Запрашиваем список...', 'info');
    try {
      const res = await axios.get('/api/spots');
      setSpots(res.data);
    } catch (error) {
      addLog(`Ошибка загрузки: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleEditClick = (spot) => {
    setEditingSpotId(spot._id);
    let cleanStatus = spot.status || 'Без статуса';
    if (cleanStatus === '⚪️ Без статуса') cleanStatus = 'Без статуса';

    const autoCoords = extractCoords(spot.googleMapsUrl);

    setFormData({
      name: spot.name, category: spot.category, rating: spot.rating, review: spot.review || '',
      imageUrl: spot.imageUrl || '', instagramUrl: spot.instagramUrl || '', location: spot.location || '',
      googleMapsUrl: spot.googleMapsUrl || '', priceLevel: spot.priceLevel || '💸', status: cleanStatus,
      tags: spot.tags ? spot.tags.join(', ') : '',
      lat: spot.lat || autoCoords.lat || '', lng: spot.lng || autoCoords.lng || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id, name) => {
    if (!window.confirm(`Реально удалить "${name}" из базы?`)) return;
    try {
      await axios.delete(`/api/spots/${id}`);
      addLog(`Успешно удалено: "${name}"`, 'success');
      fetchSpots();
    } catch (error) {
      addLog(`Ошибка удаления: ${error.message}`, 'error');
    }
  };

  const handleGoogleMapsChange = (e) => {
    const url = e.target.value;
    const coords = extractCoords(url);
    setFormData(prev => ({ ...prev, googleMapsUrl: url, lat: coords.lat || prev.lat, lng: coords.lng || prev.lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const processedTags = formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const backupCoords = extractCoords(formData.googleMapsUrl);
    const finalLat = formData.lat || backupCoords.lat;
    const finalLng = formData.lng || backupCoords.lng;

    const payload = { 
      ...formData, tags: processedTags,
      lat: finalLat ? parseFloat(finalLat) : null, lng: finalLng ? parseFloat(finalLng) : null
    };
    
    if (editingSpotId) {
      try {
        await axios.put(`/api/spots/${editingSpotId}`, payload);
        closeModal(); fetchSpots();
      } catch (error) { addLog(`Ошибка обновления`, 'error'); }
    } else {
      try {
        await axios.post('/api/spots', payload);
        closeModal(); fetchSpots();
      } catch (error) { addLog(`Ошибка добавления`, 'error'); }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditingSpotId(null); setFormData(initialFormState);
  };

  // 📲 Функция склеивания и скачивания картинки
  const downloadStory = async () => {
    const element = document.getElementById('story-card-export');
    if (!element) return;
    
    addLog('Генерируем сторис...', 'info');
    try {
      // scale: 2 делает картинку в 2 раза четче (Retina качество)
      const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: '#161b22' });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `${storySpot.name}-story.png`;
      link.click();
      addLog('✅ Карточка успешно скачана!', 'success');
    } catch (err) {
      addLog(`❌ Ошибка генерации: ${err.message}`, 'error');
    }
  };

  const filteredAndSortedSpots = spots
    .filter(spot => {
      const query = searchQuery.toLowerCase();
      const matchSearch = spot.name.toLowerCase().includes(query) || (spot.review && spot.review.toLowerCase().includes(query)) || (spot.location && spot.location.toLowerCase().includes(query)) || (spot.tags && spot.tags.some(t => t.toLowerCase().includes(query)));
      const matchCategory = selectedCategory === 'Все' || spot.category === selectedCategory;
      const matchRating = selectedRating === 'Все' || parseInt(spot.rating) === parseInt(selectedRating);
      let spotStat = spot.status || 'Без статуса';
      if (spotStat === '⚪️ Без статуса') spotStat = 'Без статуса';
      const matchStatus = selectedStatus === 'Все' || spotStat === selectedStatus;
      return matchSearch && matchCategory && matchRating && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b._id.localeCompare(a._id);
      if (sortBy === 'oldest') return a._id.localeCompare(b._id);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <>
      <style>{`
        body { margin: 0; background-color: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow-x: hidden; }
        * { box-sizing: border-box; }
        
        .filters-container { background: #161b22; padding: 15px; border-radius: 12px; border: 1px solid #30363d; margin-bottom: 20px; display: flex; flex-direction: column; gap: 15px; }
        .filters-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .categories-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
        .categories-scroll::-webkit-scrollbar { display: none; }
        
        .pill { padding: 8px 16px; background: #21262d; border: 1px solid #30363d; border-radius: 20px; color: #c9d1d9; cursor: pointer; white-space: nowrap; transition: all 0.2s; font-size: 14px; }
        .pill.active { background: #238636; border-color: #2ea043; color: white; font-weight: bold; }
        
        .search-input { flex-grow: 1; padding: 10px 15px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 20px; outline: none; font-size: 14px; min-width: 200px; }
        .select-custom { padding: 10px 15px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 20px; outline: none; font-size: 14px; cursor: pointer; }

        .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 10px 0; }
        
        .spot-card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; position: relative; }
        .spot-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.5); border-color: #8b949e; }
        
        .card-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 6px; z-index: 100; }
        .action-btn { background: rgba(13, 17, 23, 0.85); border: 1px solid #30363d; border-radius: 6px; color: #c9d1d9; cursor: pointer; padding: 5px 8px; font-size: 12px; }
        .action-btn.delete:hover { background: #da3637; color: white; border-color: #f85149; }
        .action-btn.story:hover { background: #a371f7; color: white; border-color: #d2a8ff; }

/* Фото делаем выше (150px) */
        .spot-image { width: 100%; height: 150px; object-fit: cover; background: #21262d; }
        
/* Убираем верхний отступ, так как бейджи теперь сами задают расстояние */
        .spot-content { padding: 0 10px 10px; flex-grow: 1; display: flex; flex-direction: column; gap: 6px; }
        
        /* 🔥 Тянем бейджи отрицательным отступом вверх, чтобы они сели ровно на нижний край фото */
        .badge-row { position: relative; margin-top: -28px; margin-left: 10px; margin-bottom: 8px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 90; }
        
        /* Добавили тень (box-shadow) бейджам, чтобы они не сливались со светлыми фотками */
        .spot-tag { background: #238636; color: white; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .status-tag { background: #161b22; border: 1px solid #30363d; color: #8b949e; padding: 3px 8px; border-radius: 6px; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.5); }

        .spot-title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 5px; margin-top: 4px; }
        .spot-title { margin: 0; color: #f0f6fc; font-size: 14px; word-wrap: break-word; line-height: 1.3; }
        .spot-price { font-size: 12px; color: #8b949e; font-weight: bold; white-space: nowrap; }
        .spot-location { font-size: 11px; color: #8b949e; margin: 0; display: flex; align-items: center; gap: 2px; }
        .spot-rating { margin: 0; font-size: 12px; }
        
        .mini-tags-container { display: flex; gap: 4px; flex-wrap: wrap; margin: 2px 0; }
        .mini-tag { background: #30363d; color: #c9d1d9; font-size: 9px; padding: 1px 5px; border-radius: 4px; }

        .spot-review { margin: 0; font-size: 11px; color: #8b949e; line-height: 1.4; flex-grow: 1; }
        .links-row { display: flex; gap: 10px; margin-top: auto; padding-top: 8px; border-top: 1px solid #30363d; }
        .spot-link { color: #58a6ff; text-decoration: none; font-size: 12px; font-weight: bold; }
/* 🗺 ВОТ ЭТИ СТИЛИ ДЛЯ КАРТЫ ПРОПАЛИ */
        .map-container-wrapper { height: 600px; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid #30363d; margin-top: 10px; }
        .leaflet-popup-content-wrapper { background: #161b22; color: #c9d1d9; border: 1px solid #30363d; }
        .leaflet-popup-tip { background: #161b22; border: 1px solid #30363d; }
        .leaflet-popup-content { margin: 10px; }
        .view-toggle { display: flex; background: #21262d; border-radius: 8px; overflow: hidden; border: 1px solid #30363d; }
        .view-btn { background: none; border: none; color: #8b949e; padding: 8px 16px; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .view-btn.active { background: #30363d; color: #fff; }

        @media (min-width: 768px) {
          .grid-container { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; padding: 20px 0; }
          .spot-card { border-radius: 12px; }
          .spot-image { height: 220px; }
          .badge-row { margin-left: 18px; margin-bottom: 12px; }
          .spot-content { padding: 0 18px 18px; gap: 10px; }
          .spot-tag, .status-tag { padding: 4px 10px; border-radius: 8px; font-size: 12px; }
          .spot-title { font-size: 18px; }
          .spot-price { font-size: 14px; }
          .spot-location { font-size: 13px; }
          .spot-rating { font-size: 14px; }
          .mini-tag { font-size: 11px; padding: 2px 8px; border-radius: 6px; }
          .spot-review { font-size: 13px; }
          .spot-link { font-size: 13px; }
        }

        .btn-primary { background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
        .btn-primary:hover { background: #2ea043; }
        .input-field { width: 100%; padding: 10px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; margin-bottom: 12px; font-family: inherit; font-size: 14px; }
        .input-field:focus { outline: none; border-color: #58a6ff; }
        .form-row { display: flex; gap: 10px; }
      `}</style>

      <div style={{ width: '100%', padding: '20px 4%' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ margin: 0, color: '#f0f6fc', fontSize: '28px' }}>Kyiv Spots 🇺🇦</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>📄 Списком</button>
              <button className={`view-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>🗺 На карте</button>
            </div>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Добавить</button>
          </div>
        </header>

        <div className="filters-container">
          <div className="categories-scroll">
            {CATEGORIES.map(cat => <button key={cat} className={`pill ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>)}
          </div>
          <div className="filters-row">
            <input type="text" className="search-input" placeholder="🔍 Название, отзыв, метро или тег..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <select className="select-custom" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="Все">📖 Все статусы</option>
              <option value="Уже был">✅ Уже был</option>
              <option value="Хочу сходить">📌 Хочу сходить</option>
              <option value="Без статуса">⚪️ Без статуса</option>
            </select>
            <select className="select-custom" value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
              <option value="Все">⭐️ Любой рейтинг</option>
              <option value="5">⭐⭐⭐⭐⭐ (5)</option>
              <option value="4">⭐⭐⭐⭐ (4)</option>
              <option value="3">⭐⭐⭐ (3)</option>
            </select>
            {viewMode === 'grid' && (
              <select className="select-custom" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">🕒 Сначала новые</option>
                <option value="oldest">⏳ Сначала старые</option>
                <option value="rating">🔥 По рейтингу</option>
              </select>
            )}
          </div>
        </div>

        {filteredAndSortedSpots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8b949e', fontSize: '18px' }}>Ничего не найдено 🤷‍♂️</div>
        ) : viewMode === 'grid' ? (
          <div className="grid-container">
            {filteredAndSortedSpots.map(spot => (
              <div key={spot._id} className="spot-card">
                
                <div className="card-actions">
                  {/* 📲 НОВАЯ КНОПКА СТОРИС */}
                  <button className="action-btn story" onClick={() => setStorySpot(spot)} title="Сгенерировать Сторис">📲</button>
                  <button className="action-btn" onClick={() => handleEditClick(spot)} title="Редактировать">✏️</button>
                  <button className="action-btn delete" onClick={() => handleDeleteClick(spot._id, spot.name)} title="Удалить">🗑</button>
                </div>

                {spot.imageUrl ? (
                  <img src={spot.imageUrl} alt={spot.name} className="spot-image" />
                ) : (
                  <div className="spot-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', fontSize: '14px' }}>Нет фото</div>
                )}
                <div className="spot-content">
                  <div className="badge-row">
                    <span className="spot-tag">{spot.category}</span>
                    {spot.status && spot.status !== 'Без статуса' && spot.status !== '⚪️ Без статуса' && (
                      <span className={`status-tag ${spot.status === 'Хочу сходить' ? 'wishlist' : ''}`}>
                        {spot.status === 'Хочу сходить' ? '📌 Хочу сходить' : '✅ Уже был'}
                      </span>
                    )}
                  </div>
                  <div className="spot-title-row">
                    <h3 className="spot-title">{spot.name}</h3>
                    <span className="spot-price">{spot.priceLevel}</span>
                  </div>
                  {spot.location && <p className="spot-location">📍 {spot.location}</p>}
                  <p className="spot-rating">{'⭐️'.repeat(spot.rating)}</p>
                  
                  {spot.tags && spot.tags.length > 0 && (
                    <div className="mini-tags-container">
                      {spot.tags.map((tag, idx) => <span key={idx} className="mini-tag">#{tag}</span>)}
                    </div>
                  )}
                  {spot.review && <p className="spot-review">{spot.review}</p>}
                  <div className="links-row">
{spot.instagramUrl && (
  <a href={spot.instagramUrl} target="_blank" rel="noreferrer" className="spot-link" style={{ display: 'flex', alignItems: 'center' }} title="Перейти в Instagram">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
  </a>
)}                    {spot.googleMapsUrl && <a href={spot.googleMapsUrl} target="_blank" rel="noreferrer" className="spot-link" style={{ color: '#ffb86c' }}>🗺 Маршрут</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MapView spots={filteredAndSortedSpots} onEditClick={handleEditClick} />
        )}

        {/* 📸 МОДАЛКА ГЕНЕРАЦИИ СТОРИС */}
        {storySpot && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '360px' }}>
              <h2 style={{ margin: 0, color: '#f0f6fc', fontSize: '20px' }}>Превью для Instagram</h2>
              <button onClick={() => setStorySpot(null)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '32px', cursor: 'pointer', lineHeight: '20px' }}>×</button>
            </div>

            {/* ЭТОТ БЛОК БУДЕТ СКОПИРОВАН СКРИПТОМ */}
            <div id="story-card-export" style={{ width: '360px', height: '640px', backgroundColor: '#161b22', borderRadius: '24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', border: '1px solid #30363d' }}>
              
            <div style={{ height: '55%', width: '100%', position: 'relative' }}>
                {storySpot.imageUrl ? (
                  <img src={storySpot.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="bg" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Без фото</div>
                )}
                {/* Градиент для красивого перехода к тексту */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to bottom, transparent, #161b22)' }}></div>
              </div>

              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: '-30px', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ background: '#238636', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>{storySpot.category}</span>
                  <span style={{ background: '#21262d', color: '#8b949e', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #30363d' }}>{storySpot.priceLevel}</span>
                </div>

                <h1 style={{ margin: '0 0 8px 0', color: '#f0f6fc', fontSize: '32px', lineHeight: 1.1 }}>{storySpot.name}</h1>
                
                {storySpot.location && (
                  <p style={{ margin: '0 0 12px 0', color: '#8b949e', fontSize: '15px' }}>📍 {storySpot.location}</p>
                )}

                <div style={{ fontSize: '24px', marginBottom: '16px' }}>
                  {'⭐️'.repeat(storySpot.rating)}
                </div>

                {storySpot.review && (
                  <p style={{ margin: '0 0 16px 0', color: '#c9d1d9', fontSize: '15px', lineHeight: 1.5, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{storySpot.review}"</p>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {storySpot.tags && storySpot.tags.map(t => (
                    <span key={t} style={{ background: '#30363d', color: '#c9d1d9', padding: '6px 10px', borderRadius: '8px', fontSize: '13px' }}>#{t}</span>
                  ))}
                </div>
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: '#58a6ff', fontSize: '14px', fontWeight: 'bold', opacity: 0.6 }}>@kyiv.spots</div>
              </div>
            </div>

            <button onClick={downloadStory} style={{ background: '#a371f7', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 4px 15px rgba(163, 113, 247, 0.4)' }}>
              📲 Скачать PNG
            </button>
          </div>
        )}

        {/* МОДАЛКА ДОБАВЛЕНИЯ / РЕДАКТИРОВАНИЯ */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '15px' }}>
            <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '480px', border: '1px solid #30363d', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#f0f6fc', fontSize: '22px' }}>{editingSpotId ? 'Редактировать место' : 'Новое место'}</h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '28px', cursor: 'pointer' }}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <input className="input-field" placeholder="Название заведения" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="form-row">
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ flex: 1 }}>
                    {CATEGORIES.filter(c => c !== 'Все').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ flex: 1 }}>
                    {STATUSES.map(st => <option key={st} value={st}>{st === 'Без статуса' ? '⚪️ Без статуса' : st}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#8b949e' }}>Оценка (1-5)</label>
                    <input className="input-field" type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#8b949e' }}>Уровень цен</label>
                    <select className="input-field" value={formData.priceLevel} onChange={e => setFormData({...formData, priceLevel: e.target.value})}>
                      {PRICE_LEVELS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
                    </select>
                  </div>
                </div>
                <input className="input-field" placeholder="Район / Метро (например: Подол)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                <input className="input-field" placeholder="Теги через запятую" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                <input className="input-field" placeholder="Ссылка на картинку (URL)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                <input className="input-field" placeholder="Ссылка на Instagram" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} />
                <input className="input-field" placeholder="Ссылка на Google Maps" value={formData.googleMapsUrl} onChange={handleGoogleMapsChange} />
                <div className="form-row" style={{ marginBottom: '12px' }}>
                  <input className="input-field" placeholder="Широта (lat)" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} style={{ marginBottom: 0 }} />
                  <input className="input-field" placeholder="Долгота (lng)" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} style={{ marginBottom: 0 }} />
                </div>
                <textarea className="input-field" placeholder="Твой отзыв..." value={formData.review} onChange={e => setFormData({...formData, review: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }} />
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                  {editingSpotId ? 'Сохранить изменения' : 'Сохранить в базу'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ЛОГИ */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '320px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.8)', zIndex: 1000, fontFamily: 'monospace' }}>
          <div onClick={() => setIsLogsOpen(!isLogsOpen)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', borderBottom: isLogsOpen ? '1px solid #30363d' : 'none', fontSize: '14px' }}>
            <span>📜 Логи сервера</span>
            <span>{isLogsOpen ? '▼' : '▲'}</span>
          </div>
          {isLogsOpen && (
            <div style={{ padding: '12px 16px', height: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.type === 'error' ? '#ff7b72' : log.type === 'success' ? '#3fb950' : '#8b949e', fontSize: '12px', borderBottom: '1px solid #21262d', paddingBottom: '8px' }}>
                  <span style={{ color: '#3fb950' }}>[{log.time}]</span> {log.message}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default App;