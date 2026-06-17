import { useState, useEffect } from 'react';
import axios from 'axios';

// 🌐 Подключение к бэкенду
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://kyiv-spots-app.onrender.com';

function App() {
  const [spots, setSpots] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние окна добавления
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
      setIsModalOpen(false); // Закрываем модалку после успеха
      fetchSpots();
    } catch (error) {
      addLog(`Ошибка при добавлении: ${error.message}`, 'error');
    }
  };

  return (
    <>
      {/* 💅 Стили для всей страницы и анимаций */}
      <style>{`
        body { margin: 0; background-color: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        * { box-sizing: border-box; }
        .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding: 20px 0; }
        .spot-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
        .spot-card:hover { transform: translateY(-5px); box-shadow: 0 8px 24px rgba(0,0,0,0.5); border-color: #8b949e; }
        .spot-image { width: 100%; height: 200px; object-fit: cover; background: #21262d; }
        .spot-content { padding: 16px; }
        .spot-tag { display: inline-block; background: #238636; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
        .btn-primary { background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: #2ea043; }
        .input-field { width: 100%; padding: 10px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; margin-bottom: 12px; font-family: inherit; }
        .input-field:focus { outline: none; border-color: #58a6ff; }
      `}</style>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        
        {/* ШАПКА */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: '20px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#f0f6fc' }}>Kyiv Spots 🇺🇦</h1>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Добавить место
          </button>
        </header>

        {/* СПИСОК ЗАВЕДЕНИЙ (СЕТКА) */}
        {spots.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>Пока ничего нет. Добавь первое заведение!</div>}
        
        <div className="grid-container">
          {spots.map(spot => (
            <div key={spot._id} className="spot-card">
              {spot.imageUrl ? (
                <img src={spot.imageUrl} alt={spot.name} className="spot-image" />
              ) : (
                <div className="spot-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Нет фото</div>
              )}
              <div className="spot-content">
                <span className="spot-tag">{spot.category}</span>
                <h3 style={{ margin: '0 0 10px 0', color: '#f0f6fc' }}>{spot.name}</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><strong>Оценка:</strong> {'⭐️'.repeat(spot.rating)}</p>
                <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#8b949e', lineHeight: '1.4' }}>{spot.review}</p>
                {spot.instagramUrl && (
                  <a href={spot.instagramUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                    📸 Открыть Instagram
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ВСПЛЫВАЮЩЕЕ ОКНО (МОДАЛКА) */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
            <div style={{ background: '#161b22', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#f0f6fc' }}>Новое заведение</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '24px', cursor: 'pointer' }}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <input className="input-field" placeholder="Название (например: бар с крафтом)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                
                <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Кофейня</option>
                  <option>Ресторан</option>
                  <option>Бар</option>
                  <option>Стрит-фуд</option>
                  <option>Парк / Локация</option>
                </select>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#8b949e' }}>Оценка (1-5)</label>
                  <input className="input-field" type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                </div>
                
                <input className="input-field" placeholder="Ссылка на картинку (URL)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                <input className="input-field" placeholder="Ссылка на Instagram" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} />
                
                <textarea className="input-field" placeholder="Твой отзыв (например: Идеальная клубничная матча, но маловато места...)" value={formData.review} onChange={e => setFormData({...formData, review: e.target.value})} style={{ minHeight: '100px', resize: 'vertical' }} />
                
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>Сохранить в базу</button>
              </form>
            </div>
          </div>
        )}

        {/* ВЫЕЗЖАЮЩИЕ ЛОГИ */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '350px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.8)', zIndex: 1000, fontFamily: 'monospace' }}>
          <div onClick={() => setIsLogsOpen(!isLogsOpen)} style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', borderBottom: isLogsOpen ? '1px solid #30363d' : 'none' }}>
            <span>📜 Логи сервера</span>
            <span>{isLogsOpen ? '▼' : '▲'}</span>
          </div>
          
          {isLogsOpen && (
            <div style={{ padding: '10px 15px', height: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.type === 'error' ? '#ff7b72' : log.type === 'success' ? '#3fb950' : '#8b949e', fontSize: '12px', borderBottom: '1px solid #21262d', paddingBottom: '6px' }}>
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