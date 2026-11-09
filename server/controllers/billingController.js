const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all invoices (Admin / Staff)
// @route   GET /api/billing/invoices
exports.getInvoices = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.paymentStatus = status;
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { bookingCode: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer invoices
// @route   GET /api/billing/invoices/my
exports.getCustomerInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial statistics (Admin)
// @route   GET /api/billing/stats
exports.getFinancialStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allPaidInvoices = await Invoice.find({ paymentStatus: 'paid' });
    const totalRevenue = allPaidInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    const todayInvoices = allPaidInvoices.filter(i => new Date(i.paidDate) >= startOfToday);
    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    const weekInvoices = allPaidInvoices.filter(i => new Date(i.paidDate) >= startOfWeek);
    const weekRevenue = weekInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    const monthInvoices = allPaidInvoices.filter(i => new Date(i.paidDate) >= startOfMonth);
    const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    // Recent 10 transactions
    const recentTransactions = await Invoice.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalInvoices: allPaidInvoices.length,
        todayInvoicesCount: todayInvoices.length,
      },
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/billing/coupons
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and apply coupon
// @route   POST /api/billing/coupons/apply
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (amount < coupon.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${coupon.minBookingAmount} required for this coupon`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.min((amount * coupon.discountValue) / 100, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.discountValue, amount);
    }

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/billing/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    next(error);
  }
};

