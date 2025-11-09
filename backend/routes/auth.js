// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');  // 👈 இது கண்டிப்பாக இருக்க வேண்டும்
const User = require('../models/User'); 

// --- Sign Up Route ---
router.post('/signup', async (req, res) => {
    const { name,email, password } = req.body;
    // 👇 ஒருவேளை name இல்லன்னா, இங்கே ஒரு சரிபார்ப்பு சேர்க்கவும்
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
    }
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password });
        await user.save(); // Password இங்கே தானாக Hash செய்யப்படும்

        // Sign Up வெற்றிகரமானதும், Login போல ஒரு Token-ஐ அனுப்பலாம்
        const payload = { user: { id: user.id, email: user.email } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token, email: user.email,name: user.name, message: 'Signup Successful' });
        });

    } catch (error) {
        res.status(500).send('Server Error during signup');
    }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Email' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Password,Check Your Password' });

        const payload = { id: user.id.toString() } ;
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            return res.status(200).json({ token, email: user.email,name: user.name, 
                message: 'Login Successful' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error during login');
    }
});

module.exports = router;