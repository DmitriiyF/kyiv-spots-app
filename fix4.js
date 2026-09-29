const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

// 1. Add serverLogs state and useEffect
const newLogState = `
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('appLogs');
    return saved ? JSON.parse(saved) : [];
  });
  const [serverLogs, setServerLogs] = useState([]);

  useEffect(() => {
    localStorage.setItem('appLogs', JSON.stringify(logs.slice(0, 50)));
  }, [logs]);

  useEffect(() => {
    if (isLogsOpen && isAdmin) {
      axios.get('/api/server-logs').then(res => setServerLogs(res.data)).catch(() => {});
    }
  }, [isLogsOpen, isAdmin]);

  const allLogs = [...logs, ...serverLogs].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 50);
`;

code = code.replace(
    /const \[logs, setLogs\] = useState\([\s\S]*?\}, \[logs\]\);/,
    newLogState.trim()
);

// 2. Change logs.map to allLogs.map
code = code.replace(
    /logs\.map\(\(log, i\) => \(/,
    "allLogs.map((log, i) => ("
);

// 3. Add refresh button in logs header
code = code.replace(
    /<span>Логи сервера<\/span>/,
    "<span>Логи сервера <button onClick={(e) => { e.stopPropagation(); axios.get('/api/server-logs').then(res => setServerLogs(res.data)); }} style={{background:'none', border:'none', color:'#58a6ff', cursor:'pointer', fontSize:'12px', marginLeft:'10px'}}>Оновити</button></span>"
);

fs.writeFileSync('client/src/App.jsx', code, 'utf8');
