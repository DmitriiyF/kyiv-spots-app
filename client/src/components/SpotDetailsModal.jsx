import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export default function SpotDetailsModal({ spot, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(-1);

  if (!spot) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const allPhotos = [];
  if (spot.imageUrl) allPhotos.push(spot.imageUrl);
  if (spot.gallery && spot.gallery.length > 0) {
    allPhotos.push(...spot.gallery);
  }

  const displayCategory = spot.category === 'Кофейня' ? 'Кав\'ярня' : spot.category === 'Парк / Локация' ? 'Парк / Локація' : spot.category;

  return (
    <div 
      onClick={handleOverlayClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '15px' }}
    >
      <div style={{ background: '#161b22', borderRadius: '20px', width: '100%', maxWidth: '500px', border: '1px solid #30363d', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* КНОПКА ЗАКРИТТЯ */}
        <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 5010 }}>
          <button onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '20px', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            ✕
          </button>
        </div>

        {/* HERO ОБЛОЖКА */}
        <div style={{ width: '100%', height: '300px', position: 'relative', background: '#21262d', flexShrink: 0 }}>
          {spot.imageUrl ? (
            <img 
              src={spot.imageUrl} 
              alt={spot.name} 
              onClick={() => setPhotoIndex(0)} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', cursor: 'zoom-in' }} 
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>Немає фото</div>
          )}
          
          {/* Градієнт поверх фото */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'linear-gradient(to top, rgba(22, 27, 34, 1) 0%, rgba(22, 27, 34, 0.8) 30%, transparent 100%)', pointerEvents: 'none', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}></div>
          
          {/* Інфа поверх фото (Назва, Категорія, Статус, Рейтинг) */}
          <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#4ade80', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>{displayCategory}</span>
              <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#c9d1d9', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>{spot.priceLevel}</span>
              {spot.rating ? <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>{'⭐️'.repeat(spot.rating)}</span> : null}
            </div>
            
            <h2 style={{ margin: '4px 0 0 0', color: '#f0f6fc', fontSize: '32px', lineHeight: '1.1', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{spot.name}</h2>
            
            {spot.status && spot.status !== 'Без статуса' && spot.status !== 'Без статусу' && spot.status !== '⚪️ Без статуса' && spot.status !== '⚪️ Без статусу' && (
               <div style={{ marginTop: '4px' }}>
                 <span style={{ display: 'inline-block', background: spot.status === 'Хочу сходить' || spot.status === 'Хочу відвідати' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(74, 222, 128, 0.15)', border: `1px solid ${spot.status === 'Хочу сходить' || spot.status === 'Хочу відвідати' ? 'rgba(250, 204, 21, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`, color: spot.status === 'Хочу сходить' || spot.status === 'Хочу відвідати' ? '#facc15' : '#4ade80', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                   {spot.status === 'Хочу сходить' || spot.status === 'Хочу відвідати' ? '📌 Хочу відвідати' : '✅ Вже був'}
                 </span>
               </div>
            )}
          </div>
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', zIndex: 10 }}>
          
          {/* ЛОКАЦИЯ И ТЕГИ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {spot.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c9d1d9', fontSize: '15px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 184, 108, 0.1)', color: '#ffb86c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>📍</div>
                <span style={{ lineHeight: '1.4' }}>{spot.location}</span>
              </div>
            )}
            
            {spot.tags && spot.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {spot.tags.map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.05)', color: '#8b949e', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.05)' }}>#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* ЧТО ПОПРОБОВАТЬ */}
          {spot.mustTry && (
            <div style={{ background: 'linear-gradient(135deg, rgba(218, 54, 55, 0.1), rgba(218, 54, 55, 0.02))', border: '1px solid rgba(218, 54, 55, 0.2)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔥</span>
                <h4 style={{ margin: 0, color: '#ff7b72', fontSize: '15px', fontWeight: 'bold' }}>Must Try</h4>
              </div>
              <p style={{ margin: 0, color: '#f0f6fc', fontSize: '15px', lineHeight: '1.5' }}>{spot.mustTry}</p>
            </div>
          )}

          {/* ОТЗЫВ */}
          {spot.review && (
            <div style={{ background: 'rgba(88, 166, 255, 0.05)', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>💬</span>
                <h4 style={{ margin: 0, color: '#58a6ff', fontSize: '15px', fontWeight: 'bold' }}>Відгук</h4>
              </div>
              <p style={{ margin: 0, color: '#c9d1d9', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{spot.review}"
              </p>
            </div>
          )}

          {/* ДОПОЛНИТЕЛЬНАЯ ГАЛЕРЕЯ */}
          {spot.gallery && spot.gallery.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#8b949e', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Галерея</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                {spot.gallery.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`gallery-${idx}`} 
                    onClick={() => setPhotoIndex(spot.imageUrl ? idx + 1 : idx)} 
                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'zoom-in', transition: '0.2s' }} 
                    onMouseOver={e => e.currentTarget.style.opacity = 0.8}
                    onMouseOut={e => e.currentTarget.style.opacity = 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ССЫЛКИ И КНОПКИ */}
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            {spot.googleMapsUrl && (
              <a href={spot.googleMapsUrl} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255, 184, 108, 0.1)', border: '1px solid rgba(255, 184, 108, 0.2)', color: '#ffb86c', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', transition: '0.2s' }}>
                <span style={{ fontSize: '18px' }}>🗺</span> Мапа
              </a>
            )}
            {spot.instagramUrl && (
              <a href={spot.instagramUrl} target="_blank" rel="noreferrer" style={{ flex: spot.googleMapsUrl ? '0 0 auto' : 1, width: spot.googleMapsUrl ? '54px' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(163, 113, 247, 0.1)', border: '1px solid rgba(163, 113, 247, 0.2)', color: '#d2a8ff', padding: '14px', borderRadius: '12px', textDecoration: 'none', transition: '0.2s', fontWeight: 'bold' }} title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                {!spot.googleMapsUrl && <span>Insta</span>}
              </a>
            )}
          </div>

        </div>
      </div>

      <Lightbox
        open={photoIndex >= 0}
        index={photoIndex >= 0 ? photoIndex : 0}
        close={() => setPhotoIndex(-1)}
        slides={allPhotos.map(src => ({ src }))}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        animation={{ swipe: 250 }}
      />
    </div>
  );
}