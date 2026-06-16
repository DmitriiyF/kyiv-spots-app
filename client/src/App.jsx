import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [spots, setSpots] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(true); // Состояние панели логов
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
      fetchSpots();
    } catch (error) {
      addLog(`Ошибка при добавлении: ${error.message}`, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Kyiv Spots 🇺🇦</h1>

      {/* ФОРМА ДОБАВЛЕНИЯ */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Добавить новое место</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="Название (например: Дилетант)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ padding: '8px' }}/>
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '8px' }}>
            <option>Кофейня</option><option>Ресторан</option><option>Бар</option><option>Стрит-фуд</option>
          </select>
          <input type="number" min="1" max="5" placeholder="Оценка (1-5)" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Ссылка на картинку (URL)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Ссылка на Instagram" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} style={{ padding: '8px' }} />
          <textarea placeholder="Твой отзыв..." value={formData.review} onChange={e => setFormData({...formData, review: e.target.value})} style={{ padding: '8px', minHeight: '80px' }} />
          <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Сохранить в базу</button>
        </form>
      </div>

      {/* СПИСОК */}
      <div>
        <h2>Мои заведения ({spots.length})</h2>
        {spots.map(spot => (
          <div key={spot._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', gap: '15px' }}>
            {spot.imageUrl && <img src={spot.imageUrl} alt={spot.name} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />}
            <div>
              <h3 style={{ margin: '0 0 10px 0' }}>{spot.name} <span style={{fontSize: '14px', color: '#666'}}>({spot.category})</span></h3>
              <p><strong>Оценка:</strong> {'⭐️'.repeat(spot.rating)}</p>
              <p><strong>Отзыв:</strong> {spot.review}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ВЫЕЗЖАЮЩИЕ ЛОГИ (КАК НА СКРИНЕ) */}
      <div style={{
        position: 'fixed', bottom: '20px', right: '20px', width: '380px',
        background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', zIndex: 1000, fontFamily: 'monospace'
      }}>
        <div 
          onClick={() => setIsLogsOpen(!isLogsOpen)}
          style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', borderBottom: isLogsOpen ? '1px solid #30363d' : 'none' }}
        >
          <span>📜 Логи сервера</span>
          <span>{isLogsOpen ? '▼' : '▲'}</span>
        </div>
        
        {isLogsOpen && (
          <div style={{ padding: '10px 15px', height: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ color: log.type === 'error' ? '#ff7b72' : log.type === 'success' ? '#3fb950' : '#8b949e', fontSize: '13px', borderBottom: '1px solid #21262d', paddingBottom: '6px' }}>
                <span style={{ color: '#3fb950' }}>[{log.time}]</span> {log.message} {log.type === 'success' && '✅'} {log.type === 'error' && '❌'}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;