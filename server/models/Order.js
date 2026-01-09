const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    consumerId: { type: String, required: true },
    items: [{
        productId: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'placed' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
