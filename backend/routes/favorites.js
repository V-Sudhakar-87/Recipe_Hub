// backend/routes/favorites.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const protect = require('../middleware/authMiddleware'); 

//add the favorites recipe use authentication 
router.post('/', protect, async (req, res) => {

    const { recipeId, action } = req.body; 
  
    if (!recipeId || !action) {
        return res.status(400).json({ message: 'Recipe ID and action are required' });
    }
    
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (action === 'add') {
            if (!user.favorites.includes(recipeId)) {
                user.favorites.push(recipeId);
                await user.save();
            }
            return res.json({ message: 'Recipe added to favorites', favorites: user.favorites });
            
        } else if (action === 'remove') {
            user.favorites = user.favorites.filter(id => id.toString() !== recipeId);
            await user.save();
            return res.json({ message: 'Recipe removed from favorites', favorites: user.favorites });
            
        } else {
            return res.status(400).json({ message: 'Invalid action specified' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error while managing favorites' });
    }
    
});
//get the data for favorite recipe with help of authentication
router.get('/', protect, async (req, res) => {
    try {
        
        const user = await User.findById(req.userId).select('favorites'); // favorites மட்டும் போதும்
    
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ favorites: user.favorites });

    } catch (error) {
        console.error("Error fetching favorites:", error.message);
        res.status(500).json({ message: 'Server Error fetching favorites' });
    }
});
module.exports = router;