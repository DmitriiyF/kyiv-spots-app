import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ spots }) => {
  // Выбираем топ 4 заведения с рейтингом 5 или просто новые
  const topSpots = [...spots]
    .filter(s => s.imageUrl) // желательно с фото
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div style={{ padding: '0 4%' }}>
      {/* HERO SECTION */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(163, 113, 247, 0.1))', 
        borderRadius: '24px', 
        padding: '60px 40px', 
        textAlign: 'center', 
        marginBottom: '40px',
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'rgba(88, 166, 255, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '300px', height: '300px', background: 'rgba(163, 113, 247, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>

        <h1 style={{ fontSize: '48px', color: '#f0f6fc', marginBottom: '20px', fontWeight: 800, letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>
          Где провести время в Киеве? 🇺🇦
        </h1>
        <p style={{ fontSize: '18px', color: '#8b949e', maxWidth: '600px', margin: '0 auto 30px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
          Мы собрали лучшие заведения столицы — от уютных кофеен до топовых ресторанов и баров. Находи новые места, смотри отзывы и строй маршруты.
        </p>
        <Link to="/spots" className="btn-primary" style={{ display: 'inline-block', fontSize: '18px', padding: '15px 30px', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          Смотреть все заведения
        </Link>
      </div>

      {/* TOP SPOTS */}
      {topSpots.length > 0 && (
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', color: '#f0f6fc', marginBottom: '20px' }}>🔥 Топ заведения</h2>
          <div className="grid-container">
            {topSpots.map(spot => (
              <div key={spot._id} className="spot-card" style={{ cursor: 'default' }}>
                {spot.imageUrl ? (
                  <img src={spot.imageUrl} alt={spot.name} className="spot-image" />
                ) : (
                  <div className="spot-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', fontSize: '14px' }}>Нет фото</div>
                )}
                <div className="spot-content">
                  <div className="badge-row">
                    <span className="spot-tag">{spot.category}</span>
                  </div>
                  <div className="spot-title-row">
                    <h3 className="spot-title">{spot.name}</h3>
                  </div>
                  {spot.rating ? <p className="spot-rating">{'⭐️'.repeat(spot.rating)}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
