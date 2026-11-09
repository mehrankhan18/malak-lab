const User = require('../models/User');
const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../middleware/auditMiddleware');
const { randomBytes, randomInt, createHash } = require('crypto');
const { sendOtpEmail, sendPasswordResetEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register new user/customer
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }

    // Default registration role is customer unless created by an admin
    const userRole = (req.user && req.user.role === 'admin' && role) ? role : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: userRole,
    });

    const token = generateToken(user._id);

    await logAudit({
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user._id,
      user,
      details: { email: user.email, role: user.role },
      req,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with password
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    // If staff, load staff details
    let staffProfile = null;
    if (['admin', 'pathologist', 'technician', 'receptionist'].includes(user.role)) {
      staffProfile = await Staff.findOne({ userId: user._id }).populate('assignedBranch');
    }

    await logAudit({
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      user,
      details: { email: user.email, role: user.role },
      req,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        staffProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request OTP for passwordless login
// @route   POST /api/auth/send-otp
exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ email }).select('+otp +otpExpires');
    const delivery = await sendOtpEmail(email, otp);
    if (!delivery.success) {
      return res.status(503).json({
        success: false,
        message: delivery.error === 'SMTP email delivery is not configured.'
          ? 'Email delivery is not configured. Please use password login or contact the laboratory.'
          : 'We could not deliver the verification email. Please try again later.',
      });
    }

    if (!user) {
      // Email OTP login creates a customer account after the code is delivered.
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      user = await User.create({
        name: email.split('@')[0],
        email,
        password: tempPassword,
        role: 'customer',
        otp,
        otpExpires,
      });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${email}. Check your inbox and spam folder.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a single-use password reset link without revealing account existence
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && user.isActive) {
      const resetToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(resetToken).digest('hex');
      const resetUrl = `${(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '')}/reset-password/${resetToken}`;

      user.passwordResetToken = tokenHash;
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const delivery = await sendPasswordResetEmail(user.email, resetUrl);
      if (!delivery.success) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(503).json({
          success: false,
          message: 'Password reset email is unavailable. Use password login or contact the laboratory.',
        });
      }
    } else if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(503).json({
        success: false,
        message: 'Password reset email is unavailable. Use password login or contact the laboratory.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an active account uses that email, password reset instructions will be sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set a new password using a single-use, expiring email token
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const tokenHash = createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link is invalid or expired. Request a new one.',
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated. Sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let staffProfile = null;
    if (['admin', 'pathologist', 'technician', 'receptionist'].includes(user.role)) {
      staffProfile = await Staff.findOne({ userId: user._id }).populate('assignedBranch');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        avatar: user.avatar,
        staffProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, addresses, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (addresses) user.addresses = addresses;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password for the authenticated account
// @route   POST /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    const currentPasswordMatches = await user.matchPassword(req.body.currentPassword);
    if (!currentPasswordMatches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const isSamePassword = await user.matchPassword(req.body.newPassword);
    if (isSamePassword) {
      return res.status(422).json({ success: false, message: 'Choose a new password different from your current password.' });
    }

    user.password = req.body.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    await logAudit({
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user._id,
      user,
      details: { email: user.email },
      req,
    });

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};
