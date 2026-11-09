const Booking = require('../models/Booking');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Test = require('../models/Test');
const LaboratoryReport = require('../models/LaboratoryReport');
const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');

// @desc    Get comprehensive admin dashboard analytics
// @route   GET /api/admin/dashboard-stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Counts
    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({ createdAt: { $gte: startOfToday } });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalTests = await Test.countDocuments({ isActive: true });
    const pendingReports = await LaboratoryReport.countDocuments({ status: { $in: ['draft', 'submitted_for_review'] } });
    const completedReports = await LaboratoryReport.countDocuments({ status: { $in: ['approved', 'published'] } });

    // Financial calculations
    const paidInvoices = await Invoice.find({ paymentStatus: 'paid' });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    // Recent 10 bookings
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(8).populate('branchId', 'name');

    // Recent activities (Audit Logs)
    const recentActivities = await AuditLog.find().sort({ timestamp: -1 }).limit(10);

    // Weekly booking trends (last 7 days breakdown)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayBookings = await Booking.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } });
      const dayInvoices = await Invoice.find({ paidDate: { $gte: dayStart, $lte: dayEnd }, paymentStatus: 'paid' });
      const dayRevenue = dayInvoices.reduce((s, inv) => s + inv.grandTotal, 0);

      last7Days.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        bookings: dayBookings,
        revenue: dayRevenue,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        todayBookings,
        totalCustomers,
        totalTests,
        pendingReports,
        completedReports,
        totalRevenue,
      },
      weeklyTrends: last7Days,
      recentBookings,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered patients/customers
// @route   GET /api/admin/patients
exports.getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle customer account active/block status
// @route   PUT /api/admin/patients/:id/toggle-status
exports.togglePatientStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.isActive ? 'Active' : 'Blocked'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, limit = 50 } = req.query;
    const query = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(Number(limit));
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

