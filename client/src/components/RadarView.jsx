import React, { useState, useEffect } from 'react';

const RadarView = ({ spots }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [nearestSpot, setNearestSpot] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState('');

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Геолокація не підтримується вашим пристроєм.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setError('');
      },
      (err) => {
        setError('Будь ласка, дозвольте доступ до геолокації для радару.');
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Device orientation for compass
  useEffect(() => {
    const handleOrientation = (event) => {
      let alpha = event.webkitCompassHeading || event.alpha;
      if (alpha !== null) {
        setHeading(alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      // Fallback for iOS
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate distance
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate bearing
  const getBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const l1 = lat1 * Math.PI / 180;
    const l2 = lat2 * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(l2);
    const x = Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dLon);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  useEffect(() => {
    if (!userLocation || !spots || spots.length === 0) return;

    let minDistance = Infinity;
    let closest = null;

    spots.forEach(spot => {
      const lat = parseFloat(spot.lat);
      const lng = parseFloat(spot.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const dist = getDistance(userLocation.lat, userLocation.lng, lat, lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = spot;
        }
      }
    });

    setNearestSpot(closest);
    setDistance(Math.round(minDistance));
  }, [userLocation, spots]);

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          window.location.reload();
        } else {
          setError('Потрібен доступ до сенсорів для роботи компаса.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', textAlign: 'center', background: '#161b22', borderRadius: '16px', border: '1px solid #30363d' }}>
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>🧭</div>
        <p style={{ color: '#f0f6fc', fontSize: '18px', marginBottom: '10px' }}>{error}</p>
      </div>
    );
  }

  if (!userLocation || !nearestSpot) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', textAlign: 'center', background: '#161b22', borderRadius: '16px', border: '1px solid #30363d' }}>
        <div className="radar-spinner" style={{ fontSize: '40px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>📡</div>
        <p style={{ color: '#8b949e' }}>Пошук найближчого закладу...</p>
        {typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function' && (
          <button className="btn-primary" onClick={requestPermission} style={{ marginTop: '20px' }}>Дозволити компас (iOS)</button>
        )}
      </div>
    );
  }

  const bearing = getBearing(userLocation.lat, userLocation.lng, parseFloat(nearestSpot.lat), parseFloat(nearestSpot.lng));
  const pointerRotation = bearing - heading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#161b22', borderRadius: '16px', border: '1px solid #30363d', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Radar circle UI */}
      <div style={{ position: 'relative', width: '250px', height: '250px', borderRadius: '50%', border: '2px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #21262d 0%, #161b22 100%)', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
        
        {/* Crosshairs */}
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(88, 166, 255, 0.2)' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(88, 166, 255, 0.2)' }} />

        {/* The Arrow */}
        <div style={{ 
          position: 'absolute', 
          fontSize: '60px',
          transform: `rotate(${pointerRotation}deg)`,
          transition: 'transform 0.2s ease-out',
          color: '#58a6ff',
          textShadow: '0 0 15px rgba(88, 166, 255, 0.8)'
        }}>
          ⬆
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', zIndex: 2 }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#f0f6fc', fontSize: '24px' }}>{nearestSpot.name}</h2>
        <div style={{ display: 'inline-block', background: 'rgba(88, 166, 255, 0.1)', padding: '5px 15px', borderRadius: '20px', border: '1px solid rgba(88, 166, 255, 0.3)', color: '#58a6ff', fontWeight: 'bold', fontSize: '18px' }}>
          {distance < 1000 ? `${distance} м` : `${(distance/1000).toFixed(1)} км`}
        </div>
        <p style={{ color: '#8b949e', marginTop: '10px', fontSize: '14px' }}>Рухайтесь у напрямку стрілки</p>
      </div>
    </div>
  );
};

export default RadarView;
