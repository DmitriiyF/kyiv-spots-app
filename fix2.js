const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

code = code.replace(
    /const \[logs, setLogs\] = useState\(\[\]\);/g,
    "const [logs, setLogs] = useState(() => { const saved = localStorage.getItem('appLogs'); return saved ? JSON.parse(saved) : []; });\n  useEffect(() => { localStorage.setItem('appLogs', JSON.stringify(logs.slice(0, 50))); }, [logs]);"
);

code = code.replace(
    /addLog\('Запрашиваем список...', 'info'\);/g,
    ""
);

fs.writeFileSync('client/src/App.jsx', code, 'utf8');
