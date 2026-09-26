import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    logoUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
});

export default mongoose.model('Settings', settingsSchema);
