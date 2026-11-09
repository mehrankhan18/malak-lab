const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getCustomerInvoices,
  getFinancialStats,
  getCoupons,
  applyCoupon,
  createCoupon,
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.post('/coupons/apply', applyCoupon);
router.get('/coupons', getCoupons);
router.post('/coupons', protect, authorize('admin'), createCoupon);

router.get('/invoices/my', protect, getCustomerInvoices);
router.get('/invoices', protect, authorize('admin', 'receptionist'), getInvoices);
router.get('/stats', protect, authorize('admin'), getFinancialStats);

module.exports = router;

