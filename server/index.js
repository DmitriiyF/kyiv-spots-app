import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Spot from './models/Spot.js';

dotenv.config();
const app = express();

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

// 📥 Получить все заведения
app.get('/api/spots', async (req, res) => {
    try {
        const spots = await Spot.find().sort({ createdAt: -1 });
        res.json(spots);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при получении данных" });
    }
});

// 📤 Добавить новое заведение
app.post('/api/spots', async (req, res) => {
    try {
        const newSpot = new Spot(req.body);
        await newSpot.save();
        res.json(newSpot);
    } catch (err) {
        console.error("❌ ОШИБКА СОХРАНЕНИЯ:", err.message); // <--- ДОБАВИЛИ ЭТО
        res.status(500).json({ error: "Ошибка при сохранении" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});