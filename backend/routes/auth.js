const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/register - Register new employee account
router.post('/register', register);

// GET /api/auth/me - Get current user
router.get('/me', authenticate, getMe);

module.exports = router;
