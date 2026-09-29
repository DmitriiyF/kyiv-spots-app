const fs = require('fs');

// 1. REWRITE SERVER/INDEX.JS COMPLETELY FROM SCRATCH IN PRISTINE UTF-8
const serverCode = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Spot from './models/Spot.js';
import Settings from './models/Settings.js';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

const ADMIN_PASS = process.env.ADMIN_PASS || 'dima123';
const JWT_SECRET = process.env.JWT_SECRET || 'kyivspots_super_secret';

app.use(cors());
app.use(express.json());

const serverLogs = [];
const addServerLog = (msg) => {
    const time = new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Kyiv', hour12: false });
    serverLogs.unshift({ time, message: msg, type: 'info' });
    if (serverLogs.length > 50) serverLogs.pop();
};

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Підключено до MongoDB! База kyiv_spots готова.');
        addServerLog('✅ Підключено до MongoDB! База kyiv_spots готова.');
    })
    .catch(err => {
        console.error('❌ Помилка підключення до БД:', err);
        addServerLog('❌ Помилка БД: ' + err.message);
    });

app.get('/api/ping', (req, res) => {
    console.log('⏰ Ping received from cron job - keeping server awake!');
    addServerLog('⏰ Отримано Ping (Сервер не спить)');
    res.json({ message: 'Server is awake!' });
});

app.get('/api/server-logs', (req, res) => {
    res.json(serverLogs);
});

app.post('/api/login', (req, res) => {
    if (req.body.password === ADMIN_PASS) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Неправильний пароль' });
    }
});

const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Немає доступу' });
    
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Недійсний токен' });
    }
};

app.get('/api/spots', async (req, res) => {
    try {
        const spots = await Spot.find().sort({ createdAt: -1 });
        res.json(spots);
    } catch (err) {
        res.status(500).json({ error: "Помилка завантаження" });
    }
});

app.post('/api/spots', verifyAdmin, async (req, res) => {
    try {
        const newSpot = new Spot(req.body);
        await newSpot.save();
        res.json(newSpot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/spots/:id', verifyAdmin, async (req, res) => {
    try {
        await Spot.findByIdAndDelete(req.params.id);
        res.json({ message: "Успішно видалено" });
    } catch (err) {
        res.status(500).json({ error: "Помилка при видаленні" });
    }
});

app.put('/api/spots/:id', verifyAdmin, async (req, res) => {
    try {
        const updatedSpot = await Spot.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        res.json(updatedSpot);
    } catch (err) {
        res.status(500).json({ error: "Помилка при оновленні" });
    }
});

app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ logoUrl: '', bannerUrl: '' });
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: "Помилка завантаження налаштувань" });
    }
});

app.post('/api/settings', verifyAdmin, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(req.body);
        } else {
            settings.logoUrl = req.body.logoUrl !== undefined ? req.body.logoUrl : settings.logoUrl;
            settings.bannerUrl = req.body.bannerUrl !== undefined ? req.body.bannerUrl : settings.bannerUrl;
        }
        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: "Помилка збереження налаштувань" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`🚀 Сервер працює на порту \${PORT}\`);
    addServerLog('🚀 Сервер успішно запущено');
});
`;

fs.writeFileSync('server/index.js', serverCode, 'utf8');

// 2. CLEAR FRONTEND CORRUPTED LOGS
let clientCode = fs.readFileSync('client/src/App.jsx', 'utf8');
clientCode = clientCode.replace(
    /return saved \? JSON\.parse\(saved\) : \[\];/,
    "const parsed = saved ? JSON.parse(saved) : []; if(parsed.some(l=>l.message && l.message.includes(''))) return []; return parsed;"
);
fs.writeFileSync('client/src/App.jsx', clientCode, 'utf8');

console.log("Everything fixed!");
