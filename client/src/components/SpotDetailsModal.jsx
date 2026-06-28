export default function SpotDetailsModal({ spot, onClose }) {
  if (!spot) return null;

  // Закрытие по клику на фон
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      onClick={handleOverlayClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '15px' }}
    >
      <div style={{ background: '#161b22', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid #30363d', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* КНОПКА ЗАКРЫТИЯ */}
        <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 5010 }}>
          <button onClick={onClose} style={{ background: 'rgba(13, 17, 23, 0.7)', border: '1px solid #30363d', color: '#c9d1d9', fontSize: '20px', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            ✕
          </button>
        </div>

        {/* ОБЛОЖКА */}
        <div style={{ width: '100%', height: '250px', position: 'relative', background: '#21262d' }}>
          {spot.imageUrl ? (
            <img src={spot.imageUrl} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Нет фото</div>
          )}
          {/* Градиент снизу обложки */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, transparent, #161b22)' }}></div>
          
          <div style={{ position: 'absolute', bottom: '15px', left: '20px', display: 'flex', gap: '8px' }}>
            <span style={{ background: '#238636', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{spot.category}</span>
            <span style={{ background: '#21262d', color: '#8b949e', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', border: '1px solid #30363d', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{spot.priceLevel}</span>
          </div>
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: '#f0f6fc', fontSize: '28px' }}>{spot.name}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>{'⭐️'.repeat(spot.rating)}</span>
              {spot.status && spot.status !== 'Без статуса' && spot.status !== '⚪️ Без статуса' && (
                <span style={{ background: '#161b22', border: `1px solid ${spot.status === 'Хочу сходить' ? '#388bfd' : '#30363d'}`, color: spot.status === 'Хочу сходить' ? '#58a6ff' : '#8b949e', padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>
                  {spot.status === 'Хочу сходить' ? '📌 Хочу сходить' : '✅ Уже был'}
                </span>
              )}
            </div>
          </div>

          {spot.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c9d1d9', fontSize: '15px', padding: '12px', background: '#21262d', borderRadius: '8px', border: '1px solid #30363d' }}>
              📍 <span>{spot.location}</span>
            </div>
          )}

          {spot.review && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#8b949e', fontSize: '14px' }}>Отзыв:</h4>
              <p style={{ margin: 0, color: '#c9d1d9', fontSize: '15px', lineHeight: 1.6, fontStyle: 'italic', background: 'rgba(33, 38, 45, 0.5)', padding: '15px', borderLeft: '3px solid #58a6ff', borderRadius: '0 8px 8px 0' }}>
                "{spot.review}"
              </p>
            </div>
          )}

          {spot.tags && spot.tags.length > 0 && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {spot.tags.map(t => (
                  <span key={t} style={{ background: '#30363d', color: '#c9d1d9', padding: '6px 12px', borderRadius: '12px', fontSize: '13px' }}>#{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* КНОПКИ-ССЫЛКИ */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {spot.googleMapsUrl && (
              <a href={spot.googleMapsUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', background: '#21262d', border: '1px solid #30363d', color: '#ffb86c', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', transition: '0.2s' }}>
                🗺 Открыть на карте
              </a>
            )}
            {spot.instagramUrl && (
              <a href={spot.instagramUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#21262d', border: '1px solid #30363d', color: '#58a6ff', padding: '12px', borderRadius: '8px', textDecoration: 'none', transition: '0.2s', width: '50px' }} title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}