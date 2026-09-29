const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

code = code.replace(
    /await axios\.put\([^;]+;\s+closeModal\(\);\s+fetchSpots\(\);/g,
    "await axios.put(`/api/spots/${editingSpotId}`, payload, getConfig());\n        addLog(`Успішно відредаговано: \"${payload.name}\"`, 'success');\n        closeModal(); fetchSpots();"
);

code = code.replace(
    /await axios\.post\([^;]+;\s+closeModal\(\);\s+fetchSpots\(\);/g,
    "await axios.post('/api/spots', payload, getConfig());\n        addLog(`Успішно додано: \"${payload.name}\"`, 'success');\n        closeModal(); fetchSpots();"
);

fs.writeFileSync('client/src/App.jsx', code, 'utf8');
