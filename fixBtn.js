const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

code = code.replace(
    /<span>📜 Логи сервера<\/span>/,
    "<span>📜 Логи сервера <button onClick={(e) => { e.stopPropagation(); axios.get('/api/server-logs').then(res => setServerLogs(res.data)).catch(e=>console.error('Fetch error:', e)); }} style={{background:'none', border:'none', color:'#58a6ff', cursor:'pointer', fontSize:'12px', marginLeft:'10px'}}>Оновити</button></span>"
);

fs.writeFileSync('client/src/App.jsx', code, 'utf8');
