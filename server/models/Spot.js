import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    imageUrl: String,
    instagramUrl: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Spot', spotSchema);