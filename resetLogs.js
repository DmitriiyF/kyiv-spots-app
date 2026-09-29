const fs = require('fs');

let clientCode = fs.readFileSync('client/src/App.jsx', 'utf8');
clientCode = clientCode.replace(/localStorage\.getItem\('appLogs'\)/g, "localStorage.getItem('clientLogs_v2')");
clientCode = clientCode.replace(/localStorage\.setItem\('appLogs'/g, "localStorage.setItem('clientLogs_v2'");

fs.writeFileSync('client/src/App.jsx', clientCode, 'utf8');
