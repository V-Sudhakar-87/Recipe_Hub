//server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();//load the file of .env for mango secret

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());// Middleware: Read the format for JSON fetch Front-end-

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB successfully connected! 🟢');
        // DB connection succussfull,run server port
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🔥`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error: 🔴', err);
        process.exit(1); // occur Error stop Server
    });

const cors = require('cors'); 
app.use(express.json()); // Read post json format files
app.use(cors()); 

const authRoutes = require('./routes/auth');//Login API
app.use('/api/auth', authRoutes); 
const favoritesRoutes = require('./routes/favorites'); //Favorite API
app.use('/api/favorites', favoritesRoutes);
//frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('/login', (req, res) => {
    // public/login/index.html ஃபைலை அனுப்பவும்
    res.sendFile(path.resolve(__dirname, 'public', 'login', 'index.html'));
});
app.get('/', (req, res) => {
    // public/home/home.html ஃபைலை அனுப்பவும்
    res.sendFile(path.resolve(__dirname, 'public', 'home', 'home.html')); 
});
app.get('/favorites', (req, res) => {
    // public/favorite/fav.html ஃபைலை அனுப்பவும்
    res.sendFile(path.resolve(__dirname, 'public', 'favorite', 'fav.html'));
});
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'home', 'home.html'));
});
