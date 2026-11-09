const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { createInquiry, trackInquiry, getMyInquiries } = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

router.post('/', inquiryLimiter, (req, res, next) => {
  if (req.headers.authorization) return protect(req, res, next);
  next();
}, createInquiry);
router.get('/my', protect, getMyInquiries);
router.get('/:trackingId', inquiryLimiter, trackInquiry);

module.exports = router;
