import { useState, useEffect } from 'react';
import axios from 'axios';

// 🌐 Подключение к бэкенду
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://kyiv-spots-app.onrender.com';

function App() {
  const [spots, setSpots] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Кофейня', rating: 5, review: '', imageUrl: '', instagramUrl: ''
  });

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
    setLogs(prev => [{ time, message, type }, ...prev]);
  };

  const fetchSpots = async () => {
    addLog('Запрашиваем список заведений...', 'info');
    try {
      const res = await axios.get('/api/spots');
      setSpots(res.data);
      addLog(`Успешно! Загружено: ${res.data.length}`, 'success');
    } catch (error) {
      addLog(`Ошибка загрузки: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    addLog(`Добавляем "${formData.name}"...`, 'info');
    try {
      await axios.post('/api/spots', formData);
      addLog(`Успех! Заведение добавлено.`, 'success');
      setFormData({ name: '', category: 'Кофейня', rating: 5, review: '', imageUrl: '', instagramUrl: '' });
      setIsModalOpen(false);
      fetchSpots();
    } catch (error) {
      addLog(`Ошибка при добавлении: ${error.message}`, 'error');
    }
  };

  return (
    <>
      <style>{`
        body { margin: 0; background-color: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        * { box-sizing: border-box; }
        
        /* === МОБИЛЬНАЯ ВЕРСИЯ (ПО УМОЛЧАНИЮ) === */
        /* 3 карточки в ряд */
        .grid-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px 0; }
        .spot-card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
        .spot-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.5); border-color: #8b949e; }
        
        .spot-image { width: 100%; height: 90px; object-fit: cover; background: #21262d; }
        .spot-content { padding: 8px; }
        .spot-tag { display: inline-block; background: #238636; color: white; padding: 2px 4px; border-radius: 8px; font-size: 9px; font-weight: 600; margin-bottom: 6px; }
        .spot-title { margin: 0 0 4px 0; color: #f0f6fc; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .spot-rating { margin: 0 0 6px 0; font-size: 10px; }
        /* Обрезаем длинный текст отзыва на мобилке до 3 строк */
        .spot-review { margin: 0 0 8px 0; font-size: 10px; color: #8b949e; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .spot-link { color: #58a6ff; text-decoration: none; font-size: 11px; font-weight: bold; }

        /* === ДЕСКТОПНАЯ ВЕРСИЯ (От 768px и шире) === */
        @media (min-width: 768px) {
          /* 5 карточек в ряд */
          .grid-container { grid-template-columns: repeat(5, 1fr); gap: 20px; padding: 20px 0; }
          .spot-card { border-radius: 12px; }
          .spot-image { height: 180px; }
          .spot-content { padding: 16px; }
          .spot-tag { padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-bottom: 10px; }
          .spot-title { font-size: 18px; margin-bottom: 10px; white-space: normal; overflow: visible; }
          .spot-rating { font-size: 14px; margin-bottom: 10px; }
          .spot-review { font-size: 14px; margin-bottom: 15px; -webkit-line-clamp: unset; }
          .spot-link { font-size: 14px; }
        }

        .btn-primary { background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: #2ea043; }
        .input-field { width: 100%; padding: 10px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; margin-bottom: 12px; font-family: inherit; }
        .input-field:focus { outline: none; border-color: #58a6ff; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px' }}>
        
        {/* ШАПКА */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: '15px', marginBottom: '15px' }}>
          <h1 style={{ margin: 0, color: '#f0f6fc', fontSize: '24px' }}>Kyiv Spots 🇺🇦</h1>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <span className="hide-mobile">+ </span>Добавить
          </button>
        </header>

        {/* СПИСОК ЗАВЕДЕНИЙ */}
        {spots.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>Пока ничего нет. Добавь первое заведение!</div>}
        
        <div className="grid-container">
          {spots.map(spot => (
            <div key={spot._id} className="spot-card">
              {spot.imageUrl ? (
                <img src={spot.imageUrl} alt={spot.name} className="spot-image" />
              ) : (
                <div className="spot-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', fontSize: '12px' }}>Нет фото</div>
              )}
              <div className="spot-content">
                <span className="spot-tag">{spot.category}</span>
                <h3 className="spot-title">{spot.name}</h3>
                <p className="spot-rating">{'⭐️'.repeat(spot.rating)}</p>
                <p className="spot-review">{spot.review}</p>
                {spot.instagramUrl && (
                  <a href={spot.instagramUrl} target="_blank" rel="noreferrer" className="spot-link">
                    📸 Inst
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ВСПЛЫВАЮЩЕЕ ОКНО */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '15px' }}>
            <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#f0f6fc', fontSize: '20px' }}>Новое место</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '24px', cursor: 'pointer' }}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <input className="input-field" placeholder="Название" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                
                <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Кофейня</option>
                  <option>Ресторан</option>
                  <option>Бар</option>
                  <option>Стрит-фуд</option>
                  <option>Парк / Локация</option>
                </select>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#8b949e' }}>Оценка (1-5)</label>
                  <input className="input-field" type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                </div>
                
                <input className="input-field" placeholder="Ссылка на картинку" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                <input className="input-field" placeholder="Ссылка на Instagram" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} />
                
                <textarea className="input-field" placeholder="Твой отзыв..." value={formData.review} onChange={e => setFormData({...formData, review: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }} />
                
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>Сохранить в базу</button>
              </form>
            </div>
          </div>
        )}

        {/* ЛОГИ */}
        <div style={{ position: 'fixed', bottom: '15px', right: '15px', width: '300px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.8)', zIndex: 1000, fontFamily: 'monospace' }}>
          <div onClick={() => setIsLogsOpen(!isLogsOpen)} style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', borderBottom: isLogsOpen ? '1px solid #30363d' : 'none', fontSize: '14px' }}>
            <span>📜 Логи сервера</span>
            <span>{isLogsOpen ? '▼' : '▲'}</span>
          </div>
          
          {isLogsOpen && (
            <div style={{ padding: '10px 15px', height: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.type === 'error' ? '#ff7b72' : log.type === 'success' ? '#3fb950' : '#8b949e', fontSize: '11px', borderBottom: '1px solid #21262d', paddingBottom: '6px' }}>
                  <span style={{ color: '#3fb950' }}>[{log.time}]</span> {log.message} {log.type === 'success' && '✅'} {log.type === 'error' && '❌'}
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