const Booking = require('../models/Booking');
const Patient = require('../models/Patient');
const Sample = require('../models/Sample');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');
const SystemSettings = require('../models/SystemSettings');
const Test = require('../models/Test');
const HealthPackage = require('../models/HealthPackage');
const mongoose = require('mongoose');
const { logAudit } = require('../middleware/auditMiddleware');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { nextSequence } = require('../utils/sequences');

// @desc    Create new test booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'customer') {
      return res.status(401).json({
        success: false,
        message: 'Please sign in with a patient account before booking so your records and reports are saved securely.',
      });
    }

    const {
      patientDetails,
      collectionType,
      branchId,
      appointmentDate,
      timeSlot,
      items,
      couponCode,
      paymentMethod,
      specialInstructions,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one test or health package' });
    }
    if (items.length > 100 || items.some((item) => (
      !item
      || !['test', 'package'].includes(item.itemType)
      || !mongoose.isValidObjectId(item.itemId)
    ))) {
      return res.status(422).json({ success: false, message: 'Selected catalogue items are invalid.' });
    }

    if (!patientDetails || !patientDetails.fullName || !patientDetails.phone) {
      return res.status(400).json({ success: false, message: 'Please provide required patient details' });
    }

    if (paymentMethod === 'online') {
      return res.status(503).json({
        success: false,
        message: 'Online payment is not configured. Contact MALAK Lab to confirm prices and payment options.',
      });
    }

    const requestedTestIds = items.filter((item) => item.itemType === 'test').map((item) => item.itemId);
    const requestedPackageIds = items.filter((item) => item.itemType === 'package').map((item) => item.itemId);
    const [tests, packages] = await Promise.all([
      requestedTestIds.length
        ? Test.find({ _id: { $in: requestedTestIds }, isActive: true })
          .select('name code price discountedPrice availabilityStatus sampleType')
          .lean()
        : [],
      requestedPackageIds.length
        ? HealthPackage.find({ _id: { $in: requestedPackageIds }, isActive: true })
          .select('name code packagePrice sampleTypes')
          .lean()
        : [],
    ]);
    const testsById = new Map(tests.map((test) => [String(test._id), test]));
    const packagesById = new Map(packages.map((pkg) => [String(pkg._id), pkg]));
    const bookingItems = [];

    for (const item of items) {
      const product = item.itemType === 'test'
        ? testsById.get(String(item.itemId))
        : packagesById.get(String(item.itemId));
      if (!product) {
        return res.status(409).json({
          success: false,
          message: 'A selected catalogue item is unavailable. Please refresh the catalogue.',
        });
      }

      let price;
      let sampleType = '';
      if (item.itemType === 'test') {
        if (product.availabilityStatus && product.availabilityStatus !== 'available') {
          return res.status(409).json({
            success: false,
            message: `${product.name} is not currently available for booking.`,
          });
        }
        price = product.discountedPrice ?? product.price;
        sampleType = product.sampleType || '';
      } else {
        price = product.packagePrice;
        sampleType = (product.sampleTypes || []).filter(Boolean).join(', ');
      }

      if (price === null || price === undefined || !Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(409).json({
          success: false,
          message: `A confirmed price is not available for ${product.name}. Please contact the laboratory.`,
        });
      }

      bookingItems.push({
        itemType: item.itemType,
        itemId: product._id,
        itemName: product.name,
        itemCode: product.code,
        price: Number(price),
        sampleType,
      });
    }

    const systemSettings = await SystemSettings.findOne();
    if (
      collectionType === 'home_collection' &&
      (!systemSettings || systemSettings.homeCollectionFee == null)
    ) {
      return res.status(503).json({
        success: false,
        message: 'Home collection availability and fees must be confirmed with MALAK Lab.',
      });
    }

    const customerId = req.user._id;

    // Calculate subtotal
    const subtotal = bookingItems.reduce((sum, item) => sum + item.price, 0);
    const homeCollectionFee = collectionType === 'home_collection'
      ? (systemSettings.freeCollectionThreshold != null && subtotal >= systemSettings.freeCollectionThreshold
        ? 0
        : systemSettings.homeCollectionFee)
      : 0;

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && (!coupon.validUntil || new Date(coupon.validUntil) >= new Date())) {
        if (subtotal >= coupon.minBookingAmount) {
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount);
          } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          }
          coupon.timesUsed += 1;
          await coupon.save();
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + homeCollectionFee - discountAmount);
    const year = new Date().getFullYear();
    let patient = await Patient.findOne({
      phone: patientDetails.phone,
      fullName: patientDetails.fullName.trim(),
      $or: [{ userId: customerId }, { userId: null }],
    }).collation({ locale: 'en', strength: 2 });
    if (!patient) {
      patient = new Patient({
        userId: customerId,
        fullName: patientDetails.fullName,
        age: patientDetails.age,
        gender: patientDetails.gender,
        phone: patientDetails.phone,
        email: patientDetails.email,
        address: patientDetails.address,
      });
    }
    if (!patient.patientNumber) {
      patient.patientNumber = `PAT-${await nextSequence({
        key: 'patient',
        Model: Patient,
        field: 'patientNumber',
        prefix: 'PAT-',
      })}`;
    }
    if (!patient.userId) patient.userId = customerId;
    await patient.save();

    const bookingId = `LMS-${year}-${await nextSequence({
      key: `booking-${year}`,
      Model: Booking,
      field: 'bookingId',
      prefix: `LMS-${year}-`,
    })}`;

    // Create booking
    const booking = await Booking.create({
      bookingId,
      customerId,
      patientId: patient._id,
      patientNumber: patient.patientNumber,
      patientDetails,
      collectionType,
      branchId: branchId || null,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      items: bookingItems,
      subtotal,
      homeCollectionFee,
      discountAmount,
      couponCode: couponCode || '',
      totalAmount,
      paymentStatus: 'pending',
      paymentMethod,
      transactionId: '',
      bookingStatus: 'confirmed',
      specialInstructions: specialInstructions || '',
    });

    // Auto-create Sample registration & Tracking pipeline
    const sampleId = `SMP-${year}-${await nextSequence({
      key: `sample-${year}`,
      Model: Sample,
      field: 'sampleId',
      prefix: `SMP-${year}-`,
    })}`;
    const barcode = `BC${Math.floor(100000000 + Math.random() * 900000000)}`;

    const sample = await Sample.create({
      sampleId,
      barcode,
      bookingId: booking._id,
      bookingCode: booking.bookingId,
      testIds: bookingItems.map(it => it.itemId),
      sampleType: [...new Set(bookingItems.map((item) => item.sampleType).filter(Boolean))].join(', ') || 'Not confirmed',
      currentStage: 'Booking Confirmed',
      statusHistory: [{
        stage: 'Booking Confirmed',
        timestamp: new Date(),
        updatedByName: 'System Automated Workflow',
        location: collectionType === 'home_collection' ? 'Scheduled for Home Phlebotomy' : 'Selected Branch Desk',
        remarks: `Appointment confirmed for ${new Date(appointmentDate).toDateString()} (${timeSlot})`,
      }],
    });

    // Create Invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoice = await Invoice.create({
      invoiceNumber,
      bookingId: booking._id,
      bookingCode: booking.bookingId,
      customerId,
      customerName: patientDetails.fullName,
      customerEmail: patientDetails.email,
      customerPhone: patientDetails.phone,
      items: bookingItems.map(i => ({
        description: i.itemName,
        unitPrice: i.price,
        quantity: 1,
        total: i.price,
      })),
      subtotal,
      homeCollectionFee,
      discount: discountAmount,
      grandTotal: totalAmount,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      paymentMethod,
      transactionId: booking.transactionId,
    });

    // Create in-app notification
    if (customerId) {
      await Notification.create({
        recipientId: customerId,
        title: 'Booking Confirmed',
        message: `Your booking #${booking.bookingId} has been confirmed for ${new Date(appointmentDate).toDateString()}.`,
        type: 'booking',
        link: `/customer/track/${booking.bookingId}`,
      });
    }

    // Trigger email service
    await sendBookingConfirmationEmail(booking, patientDetails);

    await logAudit({
      action: 'BOOKING_CREATE',
      entityType: 'Booking',
      entityId: booking._id,
      user: req.user,
      details: { bookingId: booking.bookingId, totalAmount, patient: patientDetails.fullName },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
      sampleId: sample.sampleId,
      invoiceNumber: invoice.invoiceNumber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of current customer
// @route   GET /api/bookings/my
exports.getCustomerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('branchId', 'name address phone');

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID or Code
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).populate('branchId').populate('assignedCollector');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (
      req.user.role === 'customer'
      && String(booking.customerId) !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Access denied to this booking.' });
    }

    const samples = await Sample.find({ bookingId: booking._id });
    const invoice = await Invoice.findOne({ bookingId: booking._id });

    res.status(200).json({ success: true, booking, samples, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (Customer or Admin)
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && String(booking.customerId) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by customer';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    await logAudit({
      action: 'BOOKING_CANCEL',
      entityType: 'Booking',
      entityId: booking._id,
      user: req.user,
      details: { reason: booking.cancellationReason },
      req,
    });

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
exports.rescheduleBooking = async (req, res, next) => {
  try {
    const { appointmentDate, timeSlot, reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.rescheduledHistory.push({
      previousDate: booking.appointmentDate,
      previousSlot: booking.timeSlot,
      rescheduledAt: new Date(),
      reason: reason || 'Customer requested date change',
    });

    booking.appointmentDate = new Date(appointmentDate);
    booking.timeSlot = timeSlot;
    booking.bookingStatus = 'rescheduled';
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking rescheduled successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin/Staff)
// @route   GET /api/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, date, collectionType, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status) query.bookingStatus = status;
    if (collectionType) query.collectionType = collectionType;
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'patientDetails.fullName': { $regex: search, $options: 'i' } },
        { 'patientDetails.phone': { $regex: search, $options: 'i' } },
      ];
    }
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: start, $lte: end };
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('branchId', 'name code')
      .populate('assignedCollector');

    res.status(200).json({
      success: true,
      total,
      count: bookings.length,
      page: Number(page),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status / assign staff
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus, paymentStatus, assignedCollector, branchId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (assignedCollector !== undefined) booking.assignedCollector = assignedCollector;
    if (branchId !== undefined) booking.branchId = branchId;

    await booking.save();

    await logAudit({
      action: 'BOOKING_STATUS_UPDATE',
      entityType: 'Booking',
      entityId: booking._id,
      user: req.user,
      details: req.body,
      req,
    });

    res.status(200).json({ success: true, message: 'Booking updated successfully', booking });
  } catch (error) {
    next(error);
  }
};
