import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ spots, siteSettings }) => {
  const topSpots = [...spots]
    .filter(s => s.imageUrl)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div style={{ padding: '0 4%' }}>
      {/* HERO SECTION */}
      <div style={{ 
        background: siteSettings?.bannerUrl ? `linear-gradient(to top, rgba(13, 17, 23, 0.95) 0%, rgba(13, 17, 23, 0.3) 50%, rgba(13, 17, 23, 0.1) 100%), url(${siteSettings.bannerUrl})` : 'linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(163, 113, 247, 0.1))', 
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
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {!siteSettings?.bannerUrl && (
          <>
            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'rgba(88, 166, 255, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '300px', height: '300px', background: 'rgba(163, 113, 247, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
          </>
        )}

        <h1 style={{ fontSize: '48px', color: '#f0f6fc', marginBottom: '15px', fontWeight: 800, letterSpacing: '-1px', position: 'relative', zIndex: 1, textShadow: siteSettings?.bannerUrl ? '0 2px 10px rgba(0,0,0,0.8)' : 'none' }}>
          Где провести время в Киеве?
        </h1>
        <p style={{ fontSize: '18px', color: '#c9d1d9', maxWidth: '600px', margin: '0 0 25px 0', lineHeight: 1.6, position: 'relative', zIndex: 1, textShadow: siteSettings?.bannerUrl ? '0 2px 5px rgba(0,0,0,0.8)' : 'none' }}>
          Я зібрав кращі заклади столиці — від затишних кав'ярень до топових ресторанів і барів.
        </p>
        <Link to="/spots" className="btn-primary" style={{ display: 'inline-block', fontSize: '16px', padding: '12px 24px', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
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
