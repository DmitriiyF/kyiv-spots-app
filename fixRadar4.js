const fs = require('fs');
let appCode = fs.readFileSync('client/src/App.jsx', 'utf8');

// Replace viewMode button
appCode = appCode.replace(
    /onClick=\{\(\) => setViewMode\('map'\)\}>[^<]+<\/button>/,
    "onClick={() => setViewMode('map')}>🗺 На мапі</button>\n                    <button className={`view-btn ${viewMode === 'radar' ? 'active' : ''}`} onClick={() => setViewMode('radar')}>🧭 Радар</button>"
);

// Replace renderViews
appCode = appCode.replace(
    /<MapView spots=\{filteredSpots\} \/>\s*<\/div>\s*\)\s*:\s*\(\s*<div className="spots-grid">/,
    `<MapView spots={filteredSpots} />
                  </div>
                ) : viewMode === 'radar' ? (
                  <div className="map-wrapper" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #30363d' }}>
                    <RadarView spots={filteredSpots} />
                  </div>
                ) : (
                  <div className="spots-grid">`
);

fs.writeFileSync('client/src/App.jsx', appCode, 'utf8');
