const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerAddress: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    description: { type: String },
    pincode: { type: String },
    image: { type: String },
    rating: { type: Number, default: 0 },
    reviews: { type: Array, default: [] }
});

module.exports = mongoose.model('Product', productSchema);
