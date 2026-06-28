import mongoose from 'mongoose';

const SpotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    rating: { type: Number, default: null }, // Теперь рейтинг может быть пустым
    review: { type: String },
    imageUrl: { type: String },
    instagramUrl: { type: String },
    location: { type: String },
    googleMapsUrl: { type: String },
    priceLevel: { type: String },
    tags: [String],
    status: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    
    // 🔥 НОВЫЕ ПОЛЯ:
    vibe: { type: String },
    mustTry: { type: String },
    gallery: [{ type: String }] // Массив ссылок для галереи
}, { timestamps: true });

export default mongoose.model('Spot', SpotSchema);