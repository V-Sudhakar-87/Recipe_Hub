// backend/controllers/authController.js
const registerUser = async (req, res) => {
    
    const { username, email, password } = req.body;

    try {
      
        res.status(201).json({ 
            message: "User registered successfully",    
        });

    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

const authUser = async (req, res) => {
    

    const { email, password } = req.body;

    try {

        res.json({
            message: "Login successful",
            
        });

    } catch (error) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};


//export 
module.exports = {
    registerUser,
    authUser,
    
};