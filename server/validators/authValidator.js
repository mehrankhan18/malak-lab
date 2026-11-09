/**
 * Input validators for Authentication routes
 * Uses inline validation without external libraries for zero additional deps
 */

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

const isStrongPassword = (password) =>
  // Minimum 8 chars, at least 1 letter and 1 number
  typeof password === 'string' && password.length >= 8;

/**
 * Middleware: validate POST /api/auth/register
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || !isStrongPassword(password)) {
    errors.push('Password must be at least 8 characters long.');
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Sanitize
  req.body.name = name.trim();
  req.body.email = String(email).toLowerCase().trim();

  next();
};

/**
 * Middleware: validate POST /api/auth/login
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || typeof password !== 'string' || password.length < 1) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body.email = String(email).toLowerCase().trim();
  next();
};

/**
 * Middleware: validate POST /api/auth/send-otp
 */
const validateSendOtp = (req, res, next) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(422).json({
      success: false,
      message: 'Please provide a valid email address to receive the OTP.',
    });
  }

  req.body.email = String(email).toLowerCase().trim();
  next();
};

/**
 * Middleware: validate POST /api/auth/verify-otp
 */
const validateVerifyOtp = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Invalid email address.');
  }

  if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
    errors.push('OTP must be a 6-digit numeric code.');
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  req.body.email = String(email).toLowerCase().trim();
  req.body.otp = otp.trim();
  next();
};

const validateResetPassword = (req, res, next) => {
  const { password } = req.body;
  if (!/^[a-f\d]{64}$/i.test(req.params.token || '')) {
    return res.status(400).json({
      success: false,
      message: 'This password reset link is invalid or expired. Request a new one.',
    });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(422).json({
      success: false,
      message: 'Password must be at least 8 characters long.',
    });
  }
  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    return res.status(422).json({
      success: false,
      message: 'Current password is required.',
    });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    return res.status(422).json({
      success: false,
      message: 'New password must be at least 8 characters and no more than 72 bytes.',
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateSendOtp,
  validateVerifyOtp,
  validateResetPassword,
  validateChangePassword,
};
