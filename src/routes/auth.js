const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Base auth route
router.get('/', (req, res) => {
  res.json({
    message: 'Authentication API',
    endpoints: {
      register: 'POST /api/auth/register',
      verifyOTP: 'POST /api/auth/verify-otp',
      resendOTP: ['GET /api/auth/resend-otp', 'POST /api/auth/resend-otp'],
      login: 'POST /api/auth/login',
      forgotPassword: 'POST /api/auth/forgot-password',
      verifyResetOTP: ['GET /api/auth/verify-reset-otp', 'POST /api/auth/verify-reset-otp'],
      resetPassword: 'POST /api/auth/reset-password',
      logout: 'POST /api/auth/logout'
    }
  });
});

// Public routes
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.get('/resend-otp', authController.resendOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-reset-otp', authController.verifyResetOTP);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', protect, authController.logout);

module.exports = router; 