
const express = require('express');

const router = express.Router();

const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');

// Import authentication middleware
const protect = require('../middleware/authMiddleware');

// Registration API
router.post('/register', registerUser);

// Login API
router.post('/login', loginUser);

// Protected profile route
router.get('/profile', protect, getProfile);

// Update user profile
router.put('/profile', protect, updateProfile);

module.exports = router;
