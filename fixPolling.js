const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

// Set up polling
const pollingEffect = `
  useEffect(() => {
    let interval;
    if (isLogsOpen && isAdmin) {
      const fetchLogs = () => {
        axios.get('/api/server-logs').then(res => {
          if (Array.isArray(res.data)) setServerLogs(res.data);
        }).catch(() => {});
      };
      fetchLogs(); // initial fetch
      interval = setInterval(fetchLogs, 5000); // fetch every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isLogsOpen, isAdmin]);
`;

code = code.replace(
    /useEffect\(\(\) => \{\s*if \(isLogsOpen && isAdmin\) \{\s*axios\.get\('\/api\/server-logs'\)[\s\S]*?\}\s*\}, \[isLogsOpen, isAdmin\]\);/,
    pollingEffect.trim()
);

// Remove the button since the user hates it
code = code.replace(
    /<span>📜 Логи сервера <button[\s\S]*?<\/button><\/span>/,
    "<span>📜 Логи сервера</span>"
);

fs.writeFileSync('client/src/App.jsx', code, 'utf8');

// Now fix backend time zone
let serverCode = fs.readFileSync('server/index.js', 'utf8');
serverCode = serverCode.replace(
    /const time = new Date\(\)\.toLocaleTimeString\('ru-RU', \{ hour12: false \}\);/,
    "const time = new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Kyiv', hour12: false });"
);
fs.writeFileSync('server/index.js', serverCode, 'utf8');
