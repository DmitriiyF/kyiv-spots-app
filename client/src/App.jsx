import { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView'; 
import 'leaflet/dist/leaflet.css'; 
import ImageUploader from './components/ImageUploader';
import html2canvas from 'html2canvas';
import SpotDetailsModal from './components/SpotDetailsModal';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://kyiv-spots-app.onrender.com';

const CATEGORIES = ['Всі', 'Кав\'ярня', 'Ресторан', 'Бар', 'Стріт-фуд', 'Парк / Локація'];
const PRICE_LEVELS = ['💸', '💸💸', '💸💸💸'];
const STATUSES = ['Без статусу', 'Вже був', 'Хочу відвідати']; 

// 🔥 Добавили vibe, mustTry и gallery в начальное состояние формы
const initialFormState = {
  name: '', category: 'Кав\'ярня', rating: '', review: '', imageUrl: '', instagramUrl: '',
  location: '', googleMapsUrl: '', priceLevel: '💸', tags: '', status: 'Без статусу', lat: '', lng: '',
  vibe: '', mustTry: '', gallery: []
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

  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpotId, setEditingSpotId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); 
  
  const [storySpot, setStorySpot] = useState(null);
  const [detailedSpot, setDetailedSpot] = useState(null); 
  
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminToken'));

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('appLogs');
    return saved ? JSON.parse(saved) : [];
  });
  const [serverLogs, setServerLogs] = useState([]);

  useEffect(() => {
    localStorage.setItem('appLogs', JSON.stringify(logs.slice(0, 50)));
  }, [logs]);

  useEffect(() => {
    let interval;
    if (isLogsOpen && isAdmin) {
      const fetchLogs = () => {
        axios.get('/api/server-logs').then(res => {
          if (Array.isArray(res.data)) setServerLogs(res.data);
        }).catch(() => {});
      };
      fetchLogs(); // initial fetch
      interval = setInterval(fetchLogs, 5000); // fetch every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isLogsOpen, isAdmin]);

  const allLogs = [...(Array.isArray(logs)?logs:[]), ...(Array.isArray(serverLogs)?serverLogs:[])].filter(l => l && l.time).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 50);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [selectedRating, setSelectedRating] = useState('Все');
  const [selectedStatus, setSelectedStatus] = useState('Всі');
  const [sortBy, setSortBy] = useState('newest');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [mobileCols, setMobileCols] = useState(2);

  const [formData, setFormData] = useState(initialFormState);
  const [siteSettings, setSiteSettings] = useState({ logoUrl: '', bannerUrl: '' });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const location = useLocation();

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
    setLogs(prev => [{ time, message, type }, ...prev]);
  };

  const fetchSpots = async () => {
    try {
      const res = await axios.get('/api/spots');
      setSpots(res.data);
    } catch (error) {
      addLog(`Ошибка загрузки: ${error.message}`, 'error');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data) setSiteSettings({ logoUrl: res.data.logoUrl || '', bannerUrl: res.data.bannerUrl || '' });
    } catch (error) {
      addLog(`Ошибка загрузки настроек: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    // Вызываем асинхронные функции без синхронных setState внутри
    const loadData = async () => {
      try {
        const [spotsRes, settingsRes] = await Promise.all([
          axios.get('/api/spots'),
          axios.get('/api/settings')
        ]);
        setSpots(spotsRes.data);
        if (settingsRes.data) {
          setSiteSettings({ 
            logoUrl: settingsRes.data.logoUrl || '', 
            bannerUrl: settingsRes.data.bannerUrl || '' 
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки данных', error);
      }
    };
    loadData();
  }, []);

  const handleEditClick = (spot) => {
    setEditingSpotId(spot._id);
    let cleanStatus = spot.status || 'Без статуса';
    if (cleanStatus === '⚪️ Без статуса') cleanStatus = 'Без статуса';

    const autoCoords = extractCoords(spot.googleMapsUrl);

    // 🔥 Подтягиваем новые поля из базы данных при редактировании
    setFormData({
      name: spot.name, category: spot.category, rating: spot.rating, review: spot.review || '',
      imageUrl: spot.imageUrl || '', instagramUrl: spot.instagramUrl || '', location: spot.location || '',
      googleMapsUrl: spot.googleMapsUrl || '', priceLevel: spot.priceLevel || '💸', status: cleanStatus,
      tags: spot.tags ? spot.tags.join(', ') : '',
      lat: spot.lat || autoCoords.lat || '', lng: spot.lng || autoCoords.lng || '',
      vibe: spot.vibe || '', mustTry: spot.mustTry || '', gallery: spot.gallery || []
    });
    setIsModalOpen(true);
  };

  const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

  // Достаем настоящую причину ошибки, а не голое error.message
  const describeError = (error) => {
    const status = error.response?.status;
    const serverMsg = error.response?.data?.error || error.response?.data?.message;
    if (status === 401) {
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      setIsLoginModalOpen(true);
      return 'Сессия админа истекла — войди заново';
    }
    return serverMsg ? `${status}: ${serverMsg}` : error.message;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { password: passwordInput });
      localStorage.setItem('adminToken', res.data.token);
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      setPasswordInput('');
      addLog('✅ Вход выполнен', 'success');
    } catch (err) {
      addLog('❌ Неверный пароль', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    addLog('🔒 Выход из админки', 'info');
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/settings', siteSettings, getConfig());
      setSiteSettings(res.data);
      addLog('✅ Настройки сохранены', 'success');
      setIsSettingsModalOpen(false);
    } catch (error) {
      addLog(`Ошибка сохранения настроек: ${describeError(error)}`, 'error');
    }
  };

  const handleDeleteClick = async (id, name) => {
    if (!window.confirm(`Реально удалить "${name}" из базы?`)) return;
    try {
      await axios.delete(`/api/spots/${id}`, getConfig());
      addLog(`Успешно удалено: "${name}"`, 'success');
      fetchSpots();
    } catch (error) {
      addLog(`Ошибка удаления: ${describeError(error)}`, 'error');
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
        await axios.put(`/api/spots/${editingSpotId}`, payload, getConfig());
        addLog(`Успішно відредаговано: "${payload.name}"`, 'success');
        closeModal(); fetchSpots();
      } catch (error) {
        setIsLogsOpen(true);
        addLog(`Ошибка обновления — ${describeError(error)}`, 'error');
      }
    } else {
      try {
        await axios.post('/api/spots', payload, getConfig());
        addLog(`Успішно додано: "${payload.name}"`, 'success');
        closeModal(); fetchSpots();
      } catch (error) {
        setIsLogsOpen(true);
        addLog(`Ошибка добавления — ${describeError(error)}`, 'error');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditingSpotId(null); setFormData(initialFormState);
  };

  const downloadStory = async () => {
    const element = document.getElementById('story-card-export');
    if (!element) return;
    
    addLog('Генерируем сторис...', 'info');
    try {
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
      const matchSearch = (spot.name || '').toLowerCase().includes(query) || (spot.review && spot.review.toLowerCase().includes(query)) || (spot.location && spot.location.toLowerCase().includes(query)) || (spot.tags && spot.tags.some(t => t.toLowerCase().includes(query)));
      const legacyCategory = spot.category === 'Кофейня' ? 'Кав\'ярня' : spot.category === 'Парк / Локация' ? 'Парк / Локація' : spot.category;
      const matchCategory = selectedCategory === 'Всі' || legacyCategory === selectedCategory;
      const matchRating = selectedRating === 'Все' || parseInt(spot.rating) === parseInt(selectedRating);
      
      let spotStat = spot.status || 'Без статусу';
      if (spotStat === 'Без статуса' || spotStat === '⚪️ Без статуса' || spotStat === '⚪️ Без статусу') spotStat = 'Без статусу';
      if (spotStat === 'Хочу сходить') spotStat = 'Хочу відвідати';
      if (spotStat === 'Уже был') spotStat = 'Вже був';
      
      const matchStatus = selectedStatus === 'Всі' || spotStat === selectedStatus;
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
        html, body, #root { max-width: 100vw; overflow-x: clip; }
        body { margin: 0; background-color: #0d1117; color: #c9d1d9; font-family: 'Inter', sans-serif; -ms-overflow-style: none; scrollbar-width: none; }
        body::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; scrollbar-width: none; -ms-overflow-style: none; }
        
        /* Modern Glassmorphism NavBar */
        .navbar {
          position: sticky; top: 0; z-index: 1000;
          background: rgba(13, 17, 23, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          padding: 8px 4%; display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .nav-logo h1 { margin: 0; color: #f0f6fc; font-size: clamp(18px, 5vw, 24px); font-weight: 800; letter-spacing: -0.5px; }
        .nav-links { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
        .nav-link { color: #8b949e; text-decoration: none; font-weight: 600; font-size: clamp(14px, 4vw, 16px); transition: color 0.2s; }
        .nav-link:hover, .nav-link.active { color: #f0f6fc; }

        .filters-container { margin-bottom: 20px; display: flex; flex-direction: column; gap: 15px; }
        .filters-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .categories-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
        .categories-scroll::-webkit-scrollbar { display: none; }
        
        .pill { padding: 8px 16px; background: rgba(33, 38, 45, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; color: #c9d1d9; cursor: pointer; white-space: nowrap; transition: all 0.2s; font-size: 14px; }
        .pill:hover { background: rgba(48, 54, 61, 0.8); }
        .pill.active { background: #58a6ff; border-color: #58a6ff; color: #0d1117; font-weight: 700; box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3); }
        
        .search-input { flex-grow: 1; padding: 12px 20px; background: rgba(13, 17, 23, 0.5); border: 1px solid rgba(255,255,255,0.1); color: #c9d1d9; border-radius: 20px; outline: none; font-size: 14px; min-width: 200px; transition: 0.2s; }
        .search-input:focus { border-color: #58a6ff; background: rgba(13, 17, 23, 0.8); }
        .select-custom { padding: 12px 20px; background: rgba(13, 17, 23, 0.5); border: 1px solid rgba(255,255,255,0.1); color: #c9d1d9; border-radius: 20px; outline: none; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .select-custom:focus { border-color: #58a6ff; }

        .grid-container { display: grid; grid-template-columns: repeat(var(--mobile-cols, 1), 1fr); gap: 16px; padding: 10px 0; }
        .home-grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 10px 0; }
        
        .spot-card { background: #161b22; border: none; border-radius: 24px; overflow: hidden; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); display: flex; flex-direction: column; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .spot-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 24px; border: 1px solid rgba(255,255,255,0.04); pointer-events: none; z-index: 10; }
        .spot-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .spot-card:hover::after { border-color: rgba(88, 166, 255, 0.3); }
        
        .card-actions { position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; z-index: 100; opacity: 0; transition: opacity 0.2s; }
        .spot-card:hover .card-actions { opacity: 1; }
        .action-btn { background: rgba(13, 17, 23, 0.6); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #c9d1d9; cursor: pointer; padding: 6px 10px; font-size: 14px; transition: 0.2s; }
        .action-btn.delete:hover { background: #da3637; color: white; border-color: #f85149; }
        .action-btn.story:hover { background: #a371f7; color: white; border-color: #d2a8ff; }

        .spot-image-wrapper { position: relative; width: 100%; height: 200px; background: #21262d; }
        .spot-image { width: 100%; height: 100%; object-fit: cover; }
        .spot-gradient { position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to top, rgba(22,27,34,1) 0%, transparent 100%); pointer-events: none; }
        
        .spot-badges-top { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 10; max-width: 80%; }
        .spot-tag, .status-tag { background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px); color: #fff; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .spot-tag { color: #4ade80; }
        .status-tag.wishlist { color: #facc15; }
        
        .spot-rating-top { position: absolute; bottom: 12px; right: 12px; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px); padding: 4px 8px; border-radius: 8px; font-size: 12px; border: 1px solid rgba(255,255,255,0.15); z-index: 10; }

        .spot-content { padding: 16px; flex-grow: 1; display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 20; background: #161b22; margin-top: -10px; border-radius: 12px 12px 0 0; }
        
        .spot-title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .spot-title { margin: 0; color: #f0f6fc; font-size: 18px; font-weight: 700; line-height: 1.2; }
        .spot-price { color: #8b949e; font-size: 14px; font-weight: bold; }
        .spot-location { color: #8b949e; font-size: 13px; margin: 0; display: flex; align-items: center; gap: 4px; }
        
        .mini-tags-container { display: flex; gap: 6px; flex-wrap: wrap; margin: 2px 0; }
        .mini-tag { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); color: #8b949e; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 6px; }

        .spot-review { margin: 4px 0 0 0; font-size: 13px; color: #c9d1d9; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex-grow: 1; }
        
        .links-row { display: flex; gap: 8px; margin-top: auto; padding-top: 16px; }
        .spot-link { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; border: 1px solid transparent; min-width: 0; }
        .spot-link span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .spot-link:hover { transform: translateY(-2px); }
        .spot-link.instagram { color: #d2a8ff; background: rgba(163, 113, 247, 0.1); border-color: rgba(163, 113, 247, 0.2); }
        .spot-link.instagram:hover { background: rgba(163, 113, 247, 0.2); box-shadow: 0 4px 12px rgba(163, 113, 247, 0.15); }
        .spot-link.maps { color: #ffb86c; background: rgba(255, 184, 108, 0.1); border-color: rgba(255, 184, 108, 0.2); }
        .spot-link.maps:hover { background: rgba(255, 184, 108, 0.2); box-shadow: 0 4px 12px rgba(255, 184, 108, 0.15); }
        
        .map-container-wrapper { height: 600px; width: 100%; border-radius: 20px; overflow: hidden; border: 1px solid #30363d; margin-top: 10px; }
        .leaflet-popup-content-wrapper { background: rgba(22, 27, 34, 0.95) !important; backdrop-filter: blur(8px); color: #c9d1d9 !important; border: 1px solid #30363d !important; border-radius: 12px !important; }
        .leaflet-popup-tip { background: rgba(22, 27, 34, 0.95) !important; border: 1px solid #30363d !important; }
        .leaflet-popup-content { margin: 12px !important; }
        .view-toggle { display: flex; background: rgba(13, 17, 23, 0.5); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); padding: 2px; }
        .view-btn { background: transparent; border: none; color: #8b949e; padding: 8px 16px; cursor: pointer; font-weight: 600; font-size: 13px; border-radius: 8px; transition: 0.2s; }
        .view-btn.active { background: #30363d; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

        @media (min-width: 768px) {
          .grid-container { grid-template-columns: repeat(3, 1fr) !important; gap: 20px; padding: 20px 0; }
          .home-grid-container { grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .spot-image-wrapper { height: 220px; }
          .spot-title { font-size: 20px; }
          .spot-price { font-size: 15px; }
          .spot-location { font-size: 14px; }
        }
        @media (min-width: 1024px) {
          .grid-container { grid-template-columns: repeat(5, 1fr) !important; gap: 24px; }
          .home-grid-container { grid-template-columns: repeat(5, 1fr); gap: 20px; }
        }

        .btn-primary { background: #58a6ff; color: #0d1117; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; box-shadow: 0 4px 12px rgba(88, 166, 255, 0.2); }
        .btn-primary:hover { background: #79c0ff; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(88, 166, 255, 0.3); }
        .input-field { width: 100%; padding: 12px; background: rgba(13, 17, 23, 0.5); border: 1px solid rgba(255,255,255,0.1); color: #c9d1d9; border-radius: 10px; margin-bottom: 16px; font-family: inherit; font-size: 14px; transition: 0.2s; }
        .input-field:focus { outline: none; border-color: #58a6ff; background: rgba(13, 17, 23, 0.8); }
        .form-row { display: flex; gap: 12px; }
      `}</style>

      {/* NAVBAR */}
      <header className="navbar">
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center' }}>
          {siteSettings.logoUrl ? (
            <img src={siteSettings.logoUrl} alt="Kyiv Spots" style={{ height: '48px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} />
          ) : (
            <>
              <div style={{ background: 'linear-gradient(135deg, #58a6ff, #a371f7)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>K</div>
              <h1>Kyiv Spots</h1>
            </>
          )}
        </Link>
        
        <div className="nav-links" style={{ flexGrow: 1 }}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Головна</Link>
          <Link to="/spots" className={`nav-link ${location.pathname === '/spots' ? 'active' : ''}`}>Заклади</Link>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin ? (
              <>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Додати</button>
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8b949e', padding: '10px', boxShadow: 'none' }} onClick={() => setIsSettingsModalOpen(true)} title="Налаштування сайту">⚙️</button>
                <button className="btn-primary" style={{ background: 'rgba(218, 54, 55, 0.1)', color: '#ff7b72', border: '1px solid rgba(218, 54, 55, 0.2)', padding: '10px', boxShadow: 'none' }} onClick={handleLogout} title="Вийти">🚪</button>
              </>
            ) : (
              <button className="btn-primary" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8b949e', padding: '10px', boxShadow: 'none' }} onClick={() => setIsLoginModalOpen(true)} title="Вхід для адміна">🔐</button>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage spots={spots} siteSettings={siteSettings} onSpotClick={setDetailedSpot} />} />
        
        <Route path="/spots" element={
          <div style={{ padding: '0 4%' }}>
            <div className="filters-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className="categories-scroll" style={{ flexGrow: 1 }}>
                  {CATEGORIES.map(cat => <button key={cat} className={`pill ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>)}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div className="view-toggle" style={{ display: 'flex' }}>
                    <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>📄 Списком</button>
                    <button className={`view-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>🗺 На мапі</button>
                  </div>
                  {viewMode === 'grid' && (
                    <div className="view-toggle" style={{ display: 'flex' }}>
                      <button className={`view-btn ${mobileCols === 1 ? 'active' : ''}`} onClick={() => setMobileCols(1)} title="1 в ряд">1 ⏹</button>
                      <button className={`view-btn ${mobileCols === 2 ? 'active' : ''}`} onClick={() => setMobileCols(2)} title="2 в ряд">2 ⏸</button>
                      <button className={`view-btn ${mobileCols === 3 ? 'active' : ''}`} onClick={() => setMobileCols(3)} title="3 в ряд">3 ⧸⧸⧸</button>
                    </div>
                  )}
                  <button className="btn-primary" style={{ padding: '8px 12px', background: 'rgba(13, 17, 23, 0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#c9d1d9', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                    Фільтри {isFiltersOpen ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {isFiltersOpen && (
                <div className="filters-row" style={{ marginTop: '5px' }}>
                  <input type="text" className="search-input" placeholder="🔍 Пошук за назвою, відгуком, метро..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <select className="select-custom" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="Всі">📖 Всі статуси</option>
                    <option value="Вже був">✅ Вже був</option>
                    <option value="Хочу відвідати">📌 Хочу відвідати</option>
                    <option value="Без статусу">⚪️ Без статусу</option>
                  </select>
                  <select className="select-custom" value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
                    <option value="Все">⭐️ Будь-який рейтинг</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                    <option value="4">⭐⭐⭐⭐ (4)</option>
                    <option value="3">⭐⭐⭐ (3)</option>
                  </select>
                  {viewMode === 'grid' && (
                    <select className="select-custom" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="newest">🕒 Спочатку нові</option>
                      <option value="oldest">⏳ Спочатку старі</option>
                      <option value="rating">🔥 За рейтингом</option>
                    </select>
                  )}
                </div>
              )}
            </div>

            {filteredAndSortedSpots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#8b949e', fontSize: '18px' }}>Нічого не знайдено 🤷‍♂️</div>
            ) : viewMode === 'grid' ? (
              <div className="grid-container" style={{ '--mobile-cols': mobileCols }}>
                {filteredAndSortedSpots.map(spot => (
                  <div key={spot._id} className="spot-card">
                    
                    <div className="card-actions">
                      <button className="action-btn story" onClick={(e) => { e.stopPropagation(); setStorySpot(spot); }} title="Згенерувати Сторіс">📲</button>
                      {isAdmin && (
                        <>
                          <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleEditClick(spot); }} title="Редагувати">✏️</button>
                          <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(spot._id, spot.name); }} title="Видалити">🗑</button>
                        </>
                      )}
                    </div>

                  {spot.imageUrl ? (
                      <div className="spot-image-wrapper" onClick={() => setDetailedSpot(spot)} style={{ cursor: 'pointer' }} title="Детальніше">
                        <img src={spot.imageUrl} alt={spot.name} className="spot-image" />
                        <div className="spot-gradient"></div>
                        <div className="spot-badges-top">
                          <span className="spot-tag">{spot.category === 'Кофейня' ? 'Кав\'ярня' : spot.category === 'Парк / Локация' ? 'Парк / Локація' : spot.category}</span>
                          {spot.status && spot.status !== 'Без статуса' && spot.status !== 'Без статусу' && spot.status !== '⚪️ Без статуса' && spot.status !== '⚪️ Без статусу' && (
                            <span className={`status-tag ${spot.status === 'Хочу сходить' || spot.status === 'Хочу відвідати' ? 'wishlist' : ''}`}>
                              {spot.status === 'Хочу сходить' || spot.status === 'Хочу відвідати' ? '📌 Хочу відвідати' : '✅ Вже був'}
                            </span>
                          )}
                        </div>
                        {spot.rating ? <div className="spot-rating-top">{'⭐️'.repeat(spot.rating)}</div> : null}
                      </div>
                    ) : (
                      <div className="spot-image-wrapper" onClick={() => setDetailedSpot(spot)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', fontSize: '14px', cursor: 'pointer' }} title="Детальніше">
                        Немає фото
                        <div className="spot-badges-top">
                          <span className="spot-tag">{spot.category === 'Кофейня' ? 'Кав\'ярня' : spot.category === 'Парк / Локация' ? 'Парк / Локація' : spot.category}</span>
                        </div>
                      </div>
                    )}
                    <div className="spot-content" onClick={() => setDetailedSpot(spot)} style={{ cursor: 'pointer' }}>
                      <div className="spot-title-row">
                        <h3 className="spot-title">{spot.name}</h3>
                        <span className="spot-price">{spot.priceLevel}</span>
                      </div>
                      {spot.location && <p className="spot-location">📍 {spot.location}</p>}
                      
                      {spot.tags && spot.tags.length > 0 && (
                        <div className="mini-tags-container">
                          {spot.tags.map((tag, idx) => <span key={idx} className="mini-tag">#{tag}</span>)}
                        </div>
                      )}
                      {spot.review && <p className="spot-review">"{spot.review}"</p>}
                      <div className="links-row">
                        {spot.instagramUrl && (
                          <a href={spot.instagramUrl} target="_blank" rel="noreferrer" className="spot-link instagram" onClick={(e) => e.stopPropagation()} title="Перейти в Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                            </svg>
                            <span>Insta</span>
                          </a>
                        )}                    
                        {spot.googleMapsUrl && (
                          <a href={spot.googleMapsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="spot-link maps">
                            <span style={{ fontSize: '16px', flexShrink: 0 }}>🗺</span>
                            <span>Мапа</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <MapView spots={filteredAndSortedSpots} onEditClick={handleEditClick} isAdmin={isAdmin} />
            )}
          </div>
        } />
      </Routes>

        {storySpot && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '360px' }}>
              <h2 style={{ margin: 0, color: '#f0f6fc', fontSize: '20px' }}>Прев'ю для Instagram</h2>
              <button onClick={() => setStorySpot(null)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '32px', cursor: 'pointer', lineHeight: '20px' }}>×</button>
            </div>

            <div id="story-card-export" style={{ width: '360px', height: '640px', backgroundColor: '#161b22', borderRadius: '24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', border: '1px solid #30363d' }}>
              
              <div style={{ height: '55%', width: '100%', position: 'relative' }}>
                {storySpot.imageUrl ? (
                  <img src={`https://wsrv.nl/?url=${encodeURIComponent(storySpot.imageUrl)}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="bg" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Без фото</div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to bottom, transparent, #161b22)' }}></div>
                
                <div style={{ position: 'absolute', bottom: '15px', left: '24px', display: 'flex', gap: '8px', zIndex: 20 }}>
                  <span style={{ background: '#238636', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {storySpot.category === 'Кофейня' ? 'Кав\'ярня' : storySpot.category === 'Парк / Локация' ? 'Парк / Локація' : storySpot.category}
                  </span>
                  <span style={{ background: '#21262d', color: '#8b949e', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #30363d', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{storySpot.priceLevel}</span>
                </div>
              </div>

              <div style={{ padding: '30px 24px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: '-30px', zIndex: 10 }}>
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
              📲 Завантажити PNG
            </button>
          </div>
        )}

        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '15px' }}>
            <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '480px', border: '1px solid #30363d', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#f0f6fc', fontSize: '22px' }}>{editingSpotId ? 'Редагувати заклад' : 'Новий заклад'}</h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '28px', cursor: 'pointer' }}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <input className="input-field" placeholder="Назва закладу" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="form-row">
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ flex: 1 }}>
                    {CATEGORIES.filter(c => c !== 'Все').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ flex: 1 }}>
                    {STATUSES.map(st => <option key={st} value={st}>{st === 'Без статуса' ? '⚪️ Без статусу' : st}</option>)}
                  </select>
                </div>
                <div className="form-row">
<div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#8b949e' }}>Оцінка (1-5)</label>
                    <input 
                      className="input-field" 
                      type="number" 
                      min="1" 
                      max="5" 
                      placeholder="?"
                      value={formData.rating} 
                      onChange={e => setFormData({...formData, rating: e.target.value})} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#8b949e' }}>Рівень цін</label>
                    <select className="input-field" value={formData.priceLevel} onChange={e => setFormData({...formData, priceLevel: e.target.value})}>
                      {PRICE_LEVELS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
                    </select>
                  </div>
                </div>

                {/* 🔥 НОВЫЕ ПОЛЯ */}
                <div className="form-row">
                  <input className="input-field" placeholder="Атмосфера (наприклад: Для побачень)" value={formData.vibe} onChange={e => setFormData({...formData, vibe: e.target.value})} style={{ flex: 1 }} />
                  <input className="input-field" placeholder="Must Try (що куштувати?)" value={formData.mustTry} onChange={e => setFormData({...formData, mustTry: e.target.value})} style={{ flex: 1 }} />
                </div>

                <input className="input-field" placeholder="Район / Метро (наприклад: Поділ)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                <input className="input-field" placeholder="Теги через кому" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                
                {/* ГЛАВНОЕ ФОТО ОБЛОЖКИ */}
                <ImageUploader 
                  imageUrl={formData.imageUrl}
                  onUploadSuccess={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                  addLog={addLog}
                />                

                {/* 🔥 ГАЛЕРЕЯ ДЛЯ ДОПОЛНИТЕЛЬНЫХ ФОТО */}
                <div style={{ background: '#21262d', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #30363d' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: '#8b949e', fontWeight: 'bold' }}>Галерея (додаткові фото):</label>
                  
                  {formData.gallery && formData.gallery.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {formData.gallery.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={img} alt={`gal-${idx}`} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #30363d' }} />
                          <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))} 
                            style={{ position: 'absolute', top: -5, right: -5, background: '#da3637', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', lineHeight: '10px', padding: 0 }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <ImageUploader 
                    imageUrl=""
                    onUploadSuccess={(url) => setFormData(prev => ({ ...prev, gallery: [...prev.gallery, url] }))}
                    addLog={addLog}
                  />
                </div>

                <input className="input-field" placeholder="Посилання на Instagram" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} />
                <input className="input-field" placeholder="Посилання на Google Maps" value={formData.googleMapsUrl} onChange={handleGoogleMapsChange} />
                <div className="form-row" style={{ marginBottom: '12px' }}>
                  <input className="input-field" placeholder="Широта (lat)" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} style={{ marginBottom: 0 }} />
                  <input className="input-field" placeholder="Довгота (lng)" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} style={{ marginBottom: 0 }} />
                </div>
                <textarea className="input-field" placeholder="Твій відгук..." value={formData.review} onChange={e => setFormData({...formData, review: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }} />
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                  {editingSpotId ? 'Зберегти зміни' : 'Зберегти в базу'}
                </button>
              </form>
            </div>
          </div>
        )}

        {isSettingsModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '15px' }}>
            <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#f0f6fc', fontSize: '20px' }}>Налаштування сайту</h2>
                <button onClick={() => setIsSettingsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '28px', cursor: 'pointer' }}>×</button>
              </div>
              <form onSubmit={handleSaveSettings}>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: '#8b949e', fontWeight: 'bold' }}>Логотип (замість "K"):</label>
                  <ImageUploader 
                    imageUrl={siteSettings.logoUrl}
                    onUploadSuccess={(url) => setSiteSettings(prev => ({ ...prev, logoUrl: url }))}
                    addLog={addLog}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: '#8b949e', fontWeight: 'bold' }}>Банер Головної (градієнт зникне):</label>
                  <ImageUploader 
                    imageUrl={siteSettings.bannerUrl}
                    onUploadSuccess={(url) => setSiteSettings(prev => ({ ...prev, bannerUrl: url }))}
                    addLog={addLog}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Зберегти налаштування</button>
              </form>
            </div>
          </div>
        )}

        {isLoginModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '15px' }}>
            <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '320px', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#f0f6fc', fontSize: '20px' }}>Вхід для адміна</h2>
                <button onClick={() => setIsLoginModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '28px', cursor: 'pointer' }}>×</button>
              </div>
              <form onSubmit={handleLogin}>
                <input type="password" placeholder="Пароль" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="input-field" autoFocus required />
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Увійти</button>
              </form>
            </div>
          </div>
        )}

        {isAdmin && (
          <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '320px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.8)', zIndex: 1000, fontFamily: 'monospace' }}>
            <div onClick={() => setIsLogsOpen(!isLogsOpen)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', borderBottom: isLogsOpen ? '1px solid #30363d' : 'none', fontSize: '14px' }}>
              <span>📜 Логи сервера</span>
              <span>{isLogsOpen ? '▼' : '▲'}</span>
            </div>
            {isLogsOpen && (
              <div style={{ padding: '12px 16px', height: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allLogs.map((log, i) => (
                  <div key={i} style={{ color: log.type === 'error' ? '#ff7b72' : log.type === 'success' ? '#3fb950' : '#8b949e', fontSize: '12px', borderBottom: '1px solid #21262d', paddingBottom: '8px' }}>
                    <span style={{ color: '#3fb950' }}>[{log.time}]</span> {log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SpotDetailsModal spot={detailedSpot} onClose={() => setDetailedSpot(null)} />
        
        <footer style={{ textAlign: 'center', marginTop: '40px', padding: '20px 0', color: '#8b949e', fontSize: '14px', borderTop: '1px solid #30363d' }}>
          <div>prod by Dmytro</div>
          <div style={{ marginTop: '10px', fontSize: '12px', maxWidth: '400px', margin: '10px auto 0 auto', lineHeight: '1.4' }}>
            Якщо сайт не працює то це значить що сервер вже прокидається і треба почекати 1 хвилинку, якщо він не завантажується більше то пишіть мені
          </div>
        </footer>
    </>
  );
}

export default App;