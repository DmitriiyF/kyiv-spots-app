const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// 1. Add server logs store
const serverLogStore = `
const serverLogs = [];
const addServerLog = (msg) => {
    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
    serverLogs.unshift({ time, message: msg, type: 'info' });
    if (serverLogs.length > 50) serverLogs.pop();
};

app.get('/api/server-logs', (req, res) => {
    res.json(serverLogs);
});
`;
code = code.replace('app.use(express.json());', 'app.use(express.json());\n' + serverLogStore);

// 2. Add log to db connect
code = code.replace(
    /console\.log\('✅ Підключено до MongoDB! База kyiv_spots готова\.'\)/,
    "console.log('✅ Підключено до MongoDB! База kyiv_spots готова.'); addServerLog('✅ Підключено до MongoDB!');"
);

// 3. Add ping endpoint
const pingEndpoint = `
app.get('/api/ping', (req, res) => {
    addServerLog('⏰ Отримано Ping (Сервер не спить)');
    res.json({ message: 'Server is awake!' });
});
`;
// find the spot before the login route
code = code.replace(/\/\/ Роут для логіну/, pingEndpoint + '\n// Роут для логіну');

// 4. Update the port listen
code = code.replace(
    /console\.log\(`🚀 Сервер працює на порту \$\{PORT\}`\);/,
    "console.log(`🚀 Сервер працює на порту ${PORT}`); addServerLog('🚀 Сервер успішно запущено');"
);

// 5. Update mongoose deprecation
code = code.replace(
    /new: true/g,
    "returnDocument: 'after'"
);

fs.writeFileSync('server/index.js', code, 'utf8');
