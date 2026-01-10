const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser'); // Deprecated but fine
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const nodemailer = require('nodemailer');

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

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: states[state],
        mongo_uri_connected: !!process.env.MONGO_URI
    });
});

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

        // Send Welcome Email (Async - don't block response)
        const mailOptions = {
            from: '"FarmDirect" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'Welcome to FarmDirect! 🚜',
            text: `Hi ${name},\n\nThank you for joining FarmDirect as a ${role}! We are excited to have you on board.\n\nBest Regards,\nThe FarmDirect Team`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Email Error: ', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

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

// Delete User (Account Deletion)
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOneAndDelete({ id: id });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting account' });
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

// Update Product
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // Ensure the farmer owns the product before updating
        const product = await Product.findOne({ id });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (updates.farmerId && product.farmerId !== updates.farmerId) {
            return res.status(403).json({ error: 'Unauthorized operation' });
        }

        const updatedProduct = await Product.findOneAndUpdate({ id }, updates, { new: true });
        res.json({ message: 'Product updated', product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { farmerId } = req.query; // Expect farmerId as query param for security check

    try {
        const product = await Product.findOne({ id });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Simple ownership check
        if (farmerId && product.farmerId !== farmerId) {
            return res.status(403).json({ error: 'Unauthorized operation' });
        }

        await Product.findOneAndDelete({ id });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// --- STATS ROUTES ---

// Get Farmer Stats (Monthly)
app.get('/api/farmer/stats/:farmerId', async (req, res) => {
    const { farmerId } = req.params;
    try {
        // Calculate start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Find orders containing products from this farmer created this month
        // This is complex because Orders store items in an array. 
        // For simplicity in this prototype, we'll fetch all orders from this month and filter in memory
        // OR better: rely on the User model's 'revenue' and 'sales' if they are meant to be ALL TIME.
        // The prompt asks for MONTHLY.

        const allOrders = await Order.find({ date: { $gte: startOfMonth } });

        let monthlyRevenue = 0;
        let monthlySales = 0;

        // Iterate orders and check items for this farmer
        for (const order of allOrders) {
            for (const item of order.items) {
                // We need to check if this item belongs to the farmer.
                // The item in Order doesn't have farmerId directly. We need to lookup product.
                // This is N+1 problem potential, but fine for small scale.
                const product = await Product.findOne({ id: item.productId });
                if (product && product.farmerId === farmerId) {
                    monthlyRevenue += (item.price * item.quantity);
                    monthlySales += item.quantity;
                }
            }
        }

        // Also get all-time stats from User model
        const farmer = await User.findOne({ id: farmerId });

        res.json({
            monthlyRevenue,
            monthlySales,
            totalRevenue: farmer ? farmer.revenue : 0,
            totalSales: farmer ? farmer.sales : 0
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: 'Failed to fetch farmer stats' });
    }
});

// --- ORDER ROUTES ---

// Create Order (Checkout)
// Email Helper Function
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: '"FarmDirect" <' + process.env.EMAIL_USER + '>',
        to: to,
        subject: subject,
        text: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Email Error: ', error);
        return false;
    }
};

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

        // 1. Fetch Consumer Details
        const consumer = await User.findOne({ id: consumerId });

        // 2. Group items by Farmer
        const farmerItems = {};
        for (const item of items) {
            const product = await Product.findOne({ id: item.productId });
            if (product) {
                if (!farmerItems[product.farmerId]) {
                    farmerItems[product.farmerId] = [];
                }
                farmerItems[product.farmerId].push({ ...item, productName: product.name });

                // Update Farmer Stats
                const revenueBoost = item.price * item.quantity;
                const salesBoost = item.quantity;
                await User.findOneAndUpdate(
                    { id: product.farmerId },
                    { $inc: { revenue: revenueBoost, sales: salesBoost } }
                );
            }
        }

        // 3. Send Email to Consumer
        if (consumer && consumer.email) {
            let emailBody = `Hi ${consumer.name},\n\nYour order has been placed successfully!\n\nOrder Details:\n`;
            items.forEach(item => {
                // We might not have product name here easily without extra lookup or passing it from frontend
                // Assuming item has minimal info, let's use what we have or generic
                emailBody += `- Product ID: ${item.productId} x ${item.quantity} (Price: ${item.price})\n`;
            });
            emailBody += `\nTotal Amount: Rs. ${totalAmount}\n\nThank you for shopping with FarmDirect!`;

            sendEmail(consumer.email, 'Order Placed - FarmDirect', emailBody);
        }

        // 4. Send Email to Each Farmer
        for (const farmerId in farmerItems) {
            const farmer = await User.findOne({ id: farmerId });
            if (farmer && farmer.email) {
                const productsList = farmerItems[farmerId];
                let farmerEmailBody = `Hello ${farmer.name},\n\nGood news! Your products have been ordered.\n\n`;
                farmerEmailBody += `Customer Details:\nName: ${consumer.name}\nAddress: ${consumer.address}\nPhone: ${consumer.mobile}\n\n`;
                farmerEmailBody += `Ordered Items:\n`;
                productsList.forEach(p => {
                    farmerEmailBody += `- ${p.productName} x ${p.quantity}\n`;
                });
                farmerEmailBody += `\nPlease prepare the order for dispatch.\n\nBest,\nFarmDirect Team`;

                sendEmail(farmer.email, 'New Order Received - FarmDirect', farmerEmailBody);
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
