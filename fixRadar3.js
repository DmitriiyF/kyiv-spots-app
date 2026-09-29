const fs = require('fs');
let appCode = fs.readFileSync('client/src/App.jsx', 'utf8');

const target1 = "<button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>📄 Списком</button>\n                    <button className={`view-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>🗺 На мапі</button>";

const replace1 = `<button className={\`view-btn \${viewMode === 'grid' ? 'active' : ''}\`} onClick={() => setViewMode('grid')}>📄 Списком</button>
                    <button className={\`view-btn \${viewMode === 'map' ? 'active' : ''}\`} onClick={() => setViewMode('map')}>🗺 На мапі</button>
                    <button className={\`view-btn \${viewMode === 'radar' ? 'active' : ''}\`} onClick={() => setViewMode('radar')}>🧭 Радар</button>`;

appCode = appCode.replace(target1, replace1);

const target2 = `{viewMode === 'map' ? (
                  <div className="map-wrapper" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #30363d' }}>
                    <MapView spots={filteredSpots} />
                  </div>
                ) : (
                  <div className="spots-grid">`;

const replace2 = `{viewMode === 'map' ? (
                  <div className="map-wrapper" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #30363d' }}>
                    <MapView spots={filteredSpots} />
                  </div>
                ) : viewMode === 'radar' ? (
                  <div className="map-wrapper" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #30363d' }}>
                    <RadarView spots={filteredSpots} />
                  </div>
                ) : (
                  <div className="spots-grid">`;

appCode = appCode.replace(target2, replace2);

fs.writeFileSync('client/src/App.jsx', appCode, 'utf8');
