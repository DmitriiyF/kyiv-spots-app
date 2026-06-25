import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Spot from './models/Spot.js';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

const ADMIN_PASS = process.env.ADMIN_PASS || 'dima123';
const JWT_SECRET = process.env.JWT_SECRET || 'kyivspots_super_secret';

app.use(cors());
app.use(express.json());

// 🔌 Подключение к БД
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Подключено к MongoDB! База kyiv_spots готова.'))
    .catch(err => console.error('❌ Ошибка БД:', err));

// 🚀 Проверочный роут
app.get('/api/ping', (req, res) => {
    res.json({ message: "Сервер работает и готов к бою! 🚀" });
});

// 🔐 МАРШРУТ ЛОГИНА (Выдает пропуск-токен, если пароль верный)
app.post('/api/login', (req, res) => {
    if (req.body.password === ADMIN_PASS) {
        // Создаем токен, который будет жить 30 дней
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Неверный пароль' });
    }
});

// 🛡 ФЕЙСКОНТРОЛЬ (Middleware для проверки пропуска)
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Достаем токен из заголовка
    if (!token) return res.status(401).json({ error: 'Доступ запрещен, нужен токен' });
    
    try {
        jwt.verify(token, JWT_SECRET); // Проверяем, не поддельный ли он и не истек ли
        next(); // Всё ок, пропускаем к выполнению маршрута
    } catch (err) {
        res.status(401).json({ error: 'Токен истек или недействителен' });
    }
};

// 📥 Получить все заведения (ОТКРЫТО ДЛЯ ГОСТЕЙ)
app.get('/api/spots', async (req, res) => {
    try {
        const spots = await Spot.find().sort({ createdAt: -1 });
        res.json(spots);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при получении данных" });
    }
});

// 📤 Добавить новое заведение (🔒 ТОЛЬКО АДМИН)
app.post('/api/spots', verifyAdmin, async (req, res) => {
    try {
        const newSpot = new Spot(req.body);
        await newSpot.save();
        res.json(newSpot);
    } catch (err) {
        console.error("❌ ОШИБКА СОХРАНЕНИЯ:", err.message);
        res.status(500).json({ error: "Ошибка при сохранении" });
    }
});

// 🗑 УДАЛИТЬ заведение (🔒 ТОЛЬКО АДМИН)
app.delete('/api/spots/:id', verifyAdmin, async (req, res) => {
    try {
        await Spot.findByIdAndDelete(req.params.id);
        res.json({ message: "Заведение успешно удалено" });
    } catch (err) {
        console.error("❌ ОШИБКА УДАЛЕНИЯ:", err.message);
        res.status(500).json({ error: "Ошибка при удалении" });
    }
});

// ✏️ РЕДАКТИРОВАТЬ заведение (🔒 ТОЛЬКО АДМИН)
app.put('/api/spots/:id', verifyAdmin, async (req, res) => {
    try {
        const updatedSpot = await Spot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSpot);
    } catch (err) {
        console.error("❌ ОШИБКА ОБНОВЛЕНИЯ:", err.message);
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});