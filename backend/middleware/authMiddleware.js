// backend/middleware/authMiddleware.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// User model-ஐ இங்கே அழைக்கத் தேவையில்லை, ID மட்டும் போதும்

const protect = async(req, res, next) => {
    let token;

    // Header-ல் Authorization: Bearer <token> இருக்கான்னு பார்க்கவும்
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) 
    {
        try {
            
            // Token-ஐப் பிரித்தெடுத்தல்
            token = req.headers.authorization.split(' ')[1];

            // Token-ஐ சரிபார்த்தல் (Verify)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
        // 🛑 Database-ல User இல்லைன்னா, இங்க 401 அனுப்பணும்
        return res.status(401).json({ message: 'User not found, authentication failed' }); 
    }
            // Token-ல் உள்ள User ID-ஐ Request-ல் இணைக்கவும் 
            req.userId = decoded.id; 
            
            next(); // Favorites Route-க்குச் செல்ல அனுமதி

        } catch (error) {
            console.error('Not authorized, token failed:', error.message);
            // 401: Unauthorized (அங்கீகாரம் இல்லை)
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // Token இல்லை என்றால்
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = protect;