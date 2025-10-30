const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/hr_system';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'HR Management System API',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('==========================================');
    console.log(`🚀 Server chạy tại port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log('==========================================');
});