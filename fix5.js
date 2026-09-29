const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

const logsBlock = `  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('appLogs');
    return saved ? JSON.parse(saved) : [];
  });
  const [serverLogs, setServerLogs] = useState([]);

  useEffect(() => {
    localStorage.setItem('appLogs', JSON.stringify(logs.slice(0, 50)));
  }, [logs]);

  useEffect(() => {
    if (isLogsOpen && isAdmin) {
      axios.get('/api/server-logs').then(res => {
        if (Array.isArray(res.data)) setServerLogs(res.data);
      }).catch(() => {});
    }
  }, [isLogsOpen, isAdmin]);

  const allLogs = [...(Array.isArray(logs)?logs:[]), ...(Array.isArray(serverLogs)?serverLogs:[])].filter(l => l && l.time).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 50);`;

// Temporarily remove it
code = code.replace(/  const \[logs, setLogs\] = useState\([\s\S]*?slice\(0, 50\);/, "");

// Insert it AFTER isAdmin and isLogsOpen
code = code.replace(/const \[isAdmin, setIsAdmin\] = useState\(!!localStorage.getItem\('adminToken'\)\);/, "const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminToken'));\n\n" + logsBlock);

fs.writeFileSync('client/src/App.jsx', code, 'utf8');
