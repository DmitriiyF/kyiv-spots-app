import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, required: true },
    review: String,
    imageUrl: String,
    instagramUrl: String,
    
    // 🆕 Новые мощные поля:
    location: String,        // Район / Метро
    googleMapsUrl: String,   // Ссылка на карты
    priceLevel: String,      // Уровень цен (💸)
    tags: [String],          // Массив тегов
    status: { type: String, default: 'Уже был' } // Статус посещения
}, { 
    timestamps: true // Автоматически добавляет время создания карточки
});

export default mongoose.model('Spot', spotSchema);