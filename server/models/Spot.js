import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, required: true },
    review: String,
    imageUrl: String,
    instagramUrl: String,
    location: String,
    googleMapsUrl: String,
    priceLevel: String,
    tags: [String],
    // 👇 Делаем статус необязательным по умолчанию
    status: { type: String, default: 'Без статуса' } 
}, { 
    timestamps: true 
});

export default mongoose.model('Spot', spotSchema);