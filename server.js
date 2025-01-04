require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Middleware for CORS
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3008', // Update with your frontend URL
}));

// Serve static files from the "client/uploads" directory
app.use('/uploads', express.static(path.join(__dirname, '../client/uploads')));

// Use authentication routes
app.use('/auth', authRoutes);

// Error handling middleware - should be placed after all routes and middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Get the port from environment variables or default to 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Log environment variables for debugging
console.log('MongoDB connection string:', process.env.MONGO_URL);
console.log('Server port:', process.env.PORT);
console.log('JWT secret:', process.env.JWT_SECRET);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
