const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping UUID for now to match frontend
    role: { type: String, required: true, enum: ['farmer', 'consumer'] },
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, default: '' },
    joinedAt: { type: Date, default: Date.now },
    // Farmer specific fields
    ratings: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
