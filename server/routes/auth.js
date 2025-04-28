const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getUserProfile, 
  updateUserProfile,
  forgotPassword,
  validateResetToken,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/resend-verification', protect, resendVerificationEmail);

module.exports = router;
