const express = require('express');
const router = express.Router();
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validateSendOtp,
  validateVerifyOtp,
  validateResetPassword,
  validateChangePassword,
} = require('../validators/authValidator');

// All auth routes have the authLimiter applied at the app.js level via /api/auth mount
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/send-otp', validateSendOtp, sendOtp);
router.post('/verify-otp', validateVerifyOtp, verifyOtp);
router.post('/forgot-password', validateSendOtp, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, validateChangePassword, changePassword);

module.exports = router;
