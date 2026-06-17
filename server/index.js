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
        console.error("❌ ОШИБКА СОХРАНЕНИЯ:", err.message);
        res.status(500).json({ error: "Ошибка при сохранении" });
    }
});

// 🗑 УДАЛИТЬ заведение
app.delete('/api/spots/:id', async (req, res) => {
    try {
        await Spot.findByIdAndDelete(req.params.id);
        res.json({ message: "Заведение успешно удалено" });
    } catch (err) {
        console.error("❌ ОШИБКА УДАЛЕНИЯ:", err.message);
        res.status(500).json({ error: "Ошибка при удалении" });
    }
});

// ✏️ РЕДАКТИРОВАТЬ заведение
app.put('/api/spots/:id', async (req, res) => {
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