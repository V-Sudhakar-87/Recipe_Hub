// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 

//put the Sign Up data to our dtabase
router.post('/signup', async (req, res) => {
    const { name,email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
    }
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password });
        await user.save(); // automatically Password Hash to send database

        const payload = { user: { id: user.id, email: user.email } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token, email: user.email,name: user.name, message: 'Signup Successful' });
        });

    } catch (error) {
        res.status(500).send('Server Error during signup');
    }
});

// put the login data to check the database 
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