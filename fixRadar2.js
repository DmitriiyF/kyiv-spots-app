const fs = require('fs');
let appCode = fs.readFileSync('client/src/App.jsx', 'utf8');

// Add Radar viewMode button
const viewModeButtons = `
                    <button className={\`view-btn \${viewMode === 'grid' ? 'active' : ''}\`} onClick={() => setViewMode('grid')}>📄 Списком</button>
                    <button className={\`view-btn \${viewMode === 'map' ? 'active' : ''}\`} onClick={() => setViewMode('map')}>🗺 На мапі</button>
                    <button className={\`view-btn \${viewMode === 'radar' ? 'active' : ''}\`} onClick={() => setViewMode('radar')}>🧭 Радар</button>
`;
appCode = appCode.replace(
    /<button className=\{\`view-btn \$\{viewMode === 'grid' \? 'active' : ''\}\`\} onClick=\{[^>]+\}>📄 Списком<\/button>\s*<button className=\{\`view-btn \$\{viewMode === 'map' \? 'active' : ''\}\`\} onClick=\{[^>]+\}>🗺 На мапі<\/button>/,
    viewModeButtons.trim()
);

// Add conditional rendering for RadarView
const renderViews = `
                {viewMode === 'map' ? (
                  <div className="map-wrapper" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #30363d' }}>
                    <MapView spots={filteredSpots} />
                  </div>
                ) : viewMode === 'radar' ? (
                  <div className="map-wrapper" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #30363d' }}>
                    <RadarView spots={filteredSpots} />
                  </div>
                ) : (
                  <div className="spots-grid">
`;
appCode = appCode.replace(
    /\{\s*viewMode === 'map' \? \(\s*<div className="map-wrapper"[\s\S]*?<MapView spots=\{filteredSpots\} \/>\s*<\/div>\s*\) : \(\s*<div className="spots-grid">/,
    renderViews.trim()
);

fs.writeFileSync('client/src/App.jsx', appCode, 'utf8');
