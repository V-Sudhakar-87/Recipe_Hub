// backend/middleware/authMiddleware.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const protect = async(req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) 
    {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
        // user not found Database,when occur  401 error
        return res.status(401).json({ message: 'User not found, authentication failed' }); 
    }
            req.userId = decoded.id; 
            next(); 
        } catch (error) {
            console.error('Not authorized, token failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = protect;
