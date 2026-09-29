const fs = require('fs');

let mapCode = fs.readFileSync('client/src/components/MapView.jsx', 'utf8');
mapCode = mapCode.replace(
    /url="https:\/\/\{s\}\.basemaps\.cartocdn\.com\/dark_all\/\{z\}\/\{x\}\/\{y\}\{r\}\.png"/,
    'url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"'
);
// Actually, Carto now strictly requires API key for web. Let's use OpenStreetMap with invert filter!
mapCode = mapCode.replace(
    /url="https:\/\/\{s\}\.basemaps\.cartocdn\.com\/rastertiles\/dark_all\/\{z\}\/\{x\}\/\{y\}\.png"/,
    'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"'
);
mapCode = mapCode.replace(
    /url="https:\/\/\{s\}\.basemaps\.cartocdn\.com\/dark_all\/\{z\}\/\{x\}\/\{y\}\{r\}\.png"/,
    'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"'
);

mapCode = mapCode.replace(
    /attribution='&copy; <a href="https:\/\/carto\.com\/attributions">CARTO<\/a>'/,
    "attribution='&copy; OpenStreetMap'"
);
fs.writeFileSync('client/src/components/MapView.jsx', mapCode, 'utf8');

// Update index.css for dark mode
let cssCode = fs.readFileSync('client/src/index.css', 'utf8');
if (!cssCode.includes('.leaflet-layer')) {
    cssCode += `\n\n.leaflet-layer, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution {\n  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);\n}\n`;
    fs.writeFileSync('client/src/index.css', cssCode, 'utf8');
}
