const fs = require('fs');
let c = fs.readFileSync('client/src/components/RadarView.jsx', 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('client/src/components/RadarView.jsx', c, 'utf8');
