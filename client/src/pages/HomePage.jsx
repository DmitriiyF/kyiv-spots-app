import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ spots, siteSettings, onSpotClick }) => {
  const topSpots = [...spots]
    .filter(s => s.imageUrl)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div style={{ padding: '0 4%' }}>
      {/* HERO SECTION */}
      <div style={{ 
        backgroundImage: siteSettings?.bannerUrl ? `linear-gradient(to top, rgba(13, 17, 23, 0.95) 0%, rgba(13, 17, 23, 0.3) 50%, rgba(13, 17, 23, 0.1) 100%), url(${siteSettings.bannerUrl})` : 'linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(163, 113, 247, 0.1))', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '24px', 
        padding: '60px 40px 40px 40px', 
        textAlign: 'left',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        marginBottom: '40px',
        border: siteSettings?.bannerUrl ? 'none' : '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {!siteSettings?.bannerUrl && (
          <>
            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'rgba(88, 166, 255, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '300px', height: '300px', background: 'rgba(163, 113, 247, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
          </>
        )}

        <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', color: '#f0f6fc', marginBottom: '15px', fontWeight: 800, letterSpacing: '-1px', position: 'relative', zIndex: 1, textShadow: siteSettings?.bannerUrl ? '0 2px 10px rgba(0,0,0,0.8)' : 'none' }}>
          Де провести час у Києві?
        </h1>
        <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: '#c9d1d9', maxWidth: '600px', margin: '0 0 25px 0', lineHeight: 1.6, position: 'relative', zIndex: 1, textShadow: siteSettings?.bannerUrl ? '0 2px 5px rgba(0,0,0,0.8)' : 'none' }}>
          Я зібрав кращі заклади столиці — від затишних кав'ярень до топових ресторанів і барів.
        </p>
        <Link to="/spots" className="btn-primary" style={{ display: 'inline-block', fontSize: '16px', padding: '12px 24px', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          Дивитись всі заклади
        </Link>
      </div>

      {/* WIDGET CUBE: RANDOM SPOT */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => {
            if (spots.length > 0) {
              const randomSpot = spots[Math.floor(Math.random() * spots.length)];
              onSpotClick && onSpotClick(randomSpot);
            } else {
              alert("Немає закладів для вибору!");
            }
          }}
          style={{ 
            width: '140px', 
            height: '140px', 
            background: 'linear-gradient(135deg, rgba(30, 35, 45, 0.8), rgba(20, 24, 32, 0.9))', 
            border: '1px solid #30363d', 
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s',
            backdropFilter: 'blur(8px)'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(88, 166, 255, 0.5)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = '#30363d';
          }}
        >
          <div style={{ fontSize: '42px', marginBottom: '10px' }}>🎲</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f0f6fc', marginBottom: '4px' }}>Рандом</div>
          <div style={{ fontSize: '11px', textAlign: 'center', color: '#8b949e', lineHeight: '1.2', padding: '0 10px' }}>
            Клікни, щоб<br/>обрати випадково
          </div>
        </button>
      </div>

      {/* TOP SPOTS */}
      {topSpots.length > 0 && (
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', color: '#f0f6fc', marginBottom: '20px' }}>🔥 Топ заклади</h2>
          <div className="home-grid-container">
            {topSpots.map(spot => (
              <div key={spot._id} className="spot-card" onClick={() => onSpotClick && onSpotClick(spot)} style={{ cursor: 'pointer' }} title="Детальніше">
                {spot.imageUrl ? (
                  <div className="spot-image-wrapper">
                    <img src={spot.imageUrl} alt={spot.name} className="spot-image" />
                    <div className="spot-gradient"></div>
                    <div className="spot-badges-top">
                      <span className="spot-tag">
                        {spot.category === 'Кофейня' ? 'Кав\'ярня' : spot.category === 'Парк / Локация' ? 'Парк / Локація' : spot.category}
                      </span>
                    </div>
                    {spot.rating ? <div className="spot-rating-top">{'⭐️'.repeat(spot.rating)}</div> : null}
                  </div>
                ) : (
                  <div className="spot-image-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', fontSize: '14px' }}>
                    Немає фото
                    <div className="spot-badges-top">
                      <span className="spot-tag">
                        {spot.category === 'Кофейня' ? 'Кав\'ярня' : spot.category === 'Парк / Локация' ? 'Парк / Локація' : spot.category}
                      </span>
                    </div>
                  </div>
                )}
                <div className="spot-content">
                  <div className="spot-title-row">
                    <h3 className="spot-title">{spot.name}</h3>
                  </div>
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
