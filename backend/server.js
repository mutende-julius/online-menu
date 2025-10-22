const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Import routes
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const clientRoutes = require('./routes/clients');

// Use routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/clients', clientRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Explicit routes for admin pages
app.get('/admin-setup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-setup.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
});

// Explicit route for waiter dashboard
app.get('/waiter-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/waiter-dashboard.html'));
});

// Serve any other HTML files directly
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, '../frontend', `${page}.html`);
    
    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Page not found' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('🚀 Digital Menu Running');
    console.log('💡 M-Pesa: Simulation Mode (Ready for demos!)');
    console.log(`🌐 Backend: http://localhost:${PORT}`);
    console.log('📱 Customer Menu: http://localhost:3000');
    console.log('👨‍🍳 Waiter Dashboard: http://localhost:3000/waiter-dashboard');
    console.log('👨‍💼 Admin Setup: http://localhost:3000/admin-setup');
    console.log('📊 Admin Dashboard: http://localhost:3000/admin-dashboard');
    console.log('✅ API Test: http://localhost:3000/api/test');
});