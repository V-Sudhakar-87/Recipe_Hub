const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
// Import the middleware correctly (assuming it's named authMiddleware)
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(express.json()); 
const cors = require('cors');
app.use(cors()); 

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB successfully connected! 🟢');
        // DB connection successful, run server port
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🔥`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error: 🔴', err);
        process.exit(1); // occur Error stop Server
    });



app.use(express.static(path.join(__dirname, '../public')));

const authRoutes = require('./routes/auth'); // Login API
app.use('/api/auth', authRoutes); 

const favoritesRoutes = require('./routes/favorites'); // Favorite API
// The middleware name is fixed to authMiddleware
app.use('/api/favorites', authMiddleware, favoritesRoutes);


// Root (/) path redirect to home
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/home/home.html')); 
});

// login page
app.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/login/index.html'));
});

// favorites page
app.get('/favorites', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/favorite/fav.html'));
});
app.use( (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/login/index.html'));
});