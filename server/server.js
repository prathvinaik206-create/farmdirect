const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser'); // Deprecated but fine
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Built-in body parser

// MongoDB Connection
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error('MongoDB Connection Error:', err));
} else {
    console.warn('WARNING: MONGO_URI is not defined. Database operations will fail.');
}

// --- AUTHENTICATION ROUTES ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { role, name, email, username, password, mobile, address } = req.body;

    // Basic Validation
    if (!name || !email || !username || !password || !mobile || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const newUser = new User({
            id: uuidv4(),
            role,
            name,
            email,
            username,
            password,
            mobile,
            address: address || ''
        });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        console.error("Signup Error:", err);
        // Return the actual error message to help debugging
        res.status(500).json({ error: err.message || 'Server error during signup' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Simple plain text password check (Insecure for production, match original logic)
        const user = await User.findOne({ username, password, role });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Update Profile
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const user = await User.findOneAndUpdate({ id: id }, updates, { new: true });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ message: "Profile updated", user });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating profile' });
    }
});


// --- PRODUCT ROUTES (Farmer) ---

// List all products (Marketplace)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Add Product
app.post('/api/products', async (req, res) => {
    const { farmerId, name, price, unit, description, pincode, image } = req.body;

    if (!farmerId || !name || !price || !unit) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const farmer = await User.findOne({ id: farmerId });
        if (!farmer) return res.status(400).json({ error: "Invalid Farmer ID" });

        const newProduct = new Product({
            id: uuidv4(),
            farmerId,
            farmerName: farmer.name,
            farmerAddress: farmer.address,
            name,
            price: parseFloat(price),
            unit,
            description,
            pincode,
            image
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product listed', product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Get Farmer's Listings
app.get('/api/products/farmer/:farmerId', async (req, res) => {
    const { farmerId } = req.params;
    try {
        const products = await Product.find({ farmerId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch farmer products' });
    }
});

// --- ORDER ROUTES ---

// Create Order (Checkout)
app.post('/api/orders', async (req, res) => {
    const { consumerId, items, totalAmount } = req.body;

    if (!consumerId || !items || items.length === 0) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    try {
        const newOrder = new Order({
            id: uuidv4(),
            consumerId,
            items,
            totalAmount
        });

        await newOrder.save();

        // Update farmer sales/revenue
        // Note: Ideally transactions should be used here
        for (const item of items) {
            const product = await Product.findOne({ id: item.productId });
            if (product) {
                const revenueBoost = item.price * item.quantity;
                const salesBoost = item.quantity;

                await User.findOneAndUpdate(
                    { id: product.farmerId },
                    {
                        $inc: { revenue: revenueBoost, sales: salesBoost }
                    }
                );
            }
        }

        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
