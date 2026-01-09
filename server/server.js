const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// --- AUTHENTICATION ROUTES ---

// Signup
app.post('/api/auth/signup', (req, res) => {
    const { role, name, email, username, password, mobile, address } = req.body;

    // Basic Validation
    if (!name || !email || !username || !password || !mobile || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = db.get('users').find({ username }).value();
    if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
    }

    const newUser = {
        id: uuidv4(),
        role, // 'farmer' or 'consumer'
        name,
        email,
        username,
        password, // In a real app, hash this!
        mobile,
        address: address || '', // Only mandatory for farmer usually, but good to have
        joinedAt: new Date().toISOString(),
        // Specific fields
        ratings: role === 'farmer' ? 0 : undefined,
        sales: role === 'farmer' ? 0 : undefined,
        revenue: role === 'farmer' ? 0 : undefined,
    };

    db.get('users').push(newUser).write();

    res.status(201).json({ message: 'User created successfully', user: newUser });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password, role } = req.body;

    const user = db.get('users').find({ username, password, role }).value();

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
});

// Update Profile
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating id or role if needed, but for now allow basic edits
    // In real app, validate 'updates'

    const user = db.get('users').find({ id }).assign(updates).write();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Profile updated", user });
});


// --- PRODUCT ROUTES (Farmer) ---

// List all products (Marketplace)
app.get('/api/products', (req, res) => {
    const products = db.get('products').value();
    res.json(products);
});

// Add Product
app.post('/api/products', (req, res) => {
    const { farmerId, name, price, unit, description, pincode, image } = req.body;

    if (!farmerId || !name || !price || !unit) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const farmer = db.get('users').find({ id: farmerId }).value();
    if (!farmer) return res.status(400).json({ error: "Invalid Farmer ID" });

    const newProduct = {
        id: uuidv4(),
        farmerId,
        farmerName: farmer.name,
        farmerAddress: farmer.address, // simple caching of address
        name,
        price: parseFloat(price),
        unit, // kg, litre, etc
        description,
        pincode,
        image, // URL or base64
        rating: 0,
        reviews: []
    };

    db.get('products').push(newProduct).write();
    res.status(201).json({ message: 'Product listed', product: newProduct });
});

// Get Farmer's Listings
app.get('/api/products/farmer/:farmerId', (req, res) => {
    const { farmerId } = req.params;
    const products = db.get('products').filter({ farmerId }).value();
    res.json(products);
});

// --- ORDER ROUTES ---

// Create Order (Checkout)
app.post('/api/orders', (req, res) => {
    const { consumerId, items, totalAmount } = req.body;

    if (!consumerId || !items || items.length === 0) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const newOrder = {
        id: uuidv4(),
        consumerId,
        items, // Array of { productId, quantity, price }
        totalAmount,
        status: 'placed',
        date: new Date().toISOString()
    };

    db.get('orders').push(newOrder).write();

    // Update farmer sales/revenue (Optional simplification)
    items.forEach(item => {
        const product = db.get('products').find({ id: item.productId }).value();
        if (product) {
            const seller = db.get('users').find({ id: product.farmerId });
            const currentRevenue = seller.value().revenue || 0;
            const currentSales = seller.value().sales || 0;
            seller.assign({
                revenue: currentRevenue + (item.price * item.quantity),
                sales: currentSales + item.quantity
            }).write();
        }
    });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
