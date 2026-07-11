const express = require('express');
const router = express.Router();
const { login, getMe, logout, updateMyProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');


router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateMyProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
