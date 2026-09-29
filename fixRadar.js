const fs = require('fs');

let cssCode = fs.readFileSync('client/src/index.css', 'utf8');
if (!cssCode.includes('@keyframes spin')) {
    cssCode += `\n@keyframes spin { 100% { transform: rotate(360deg); } }\n`;
    fs.writeFileSync('client/src/index.css', cssCode, 'utf8');
}

let appCode = fs.readFileSync('client/src/App.jsx', 'utf8');

// Import RadarView
if (!appCode.includes('import RadarView')) {
    appCode = appCode.replace(
        "import MapView from './components/MapView';",
        "import MapView from './components/MapView';\nimport RadarView from './components/RadarView';"
    );
}

// Add Radar viewMode button
const viewModeButtons = `
                    <button className={\`view-btn \${viewMode === 'grid' ? 'active' : ''}\`} onClick={() => setViewMode('grid')}>📋 Списком</button>
                    <button className={\`view-btn \${viewMode === 'map' ? 'active' : ''}\`} onClick={() => setViewMode('map')}>🗺️ На мапі</button>
                    <button className={\`view-btn \${viewMode === 'radar' ? 'active' : ''}\`} onClick={() => setViewMode('radar')}>🧭 Радар</button>
`;
appCode = appCode.replace(
    /<button className=\{\`view-btn \$\{viewMode === 'grid' \? 'active' : ''\}\`\} onClick=\{[^>]+\}>📋 Списком<\/button>\s*<button className=\{\`view-btn \$\{viewMode === 'map' \? 'active' : ''\}\`\} onClick=\{[^>]+\}>🗺️ На мапі<\/button>/,
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
