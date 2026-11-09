const crypto = require('crypto');
const mongoose = require('mongoose');
const Test = require('../models/Test');
const HealthPackage = require('../models/HealthPackage');
const TestInquiry = require('../models/TestInquiry');
const Booking = require('../models/Booking');
const Branch = require('../models/Branch');
const Patient = require('../models/Patient');
const Sample = require('../models/Sample');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const SystemSettings = require('../models/SystemSettings');
const { logAudit } = require('../middleware/auditMiddleware');
const { nextSequence } = require('../utils/sequences');

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const createTrackingId = () => {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `MLR-${datePart}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

exports.createInquiry = async (req, res, next) => {
  try {
    const patientName = String(req.body.patientName || '').trim();
    const phone = normalizePhone(req.body.phone);
    const { items, reportDelivery } = req.body;

    if (patientName.length < 2 || patientName.length > 100) {
      return res.status(400).json({ success: false, message: 'Enter your name (2 to 100 characters).' });
    }
    if (phone.length < 7 || phone.length > 15) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number so you can check your request later.' });
    }
    if (!Array.isArray(items) || items.length < 1 || items.length > 25) {
      return res.status(400).json({ success: false, message: 'Select between 1 and 25 tests or packages.' });
    }
    if (!['online', 'physical'].includes(reportDelivery)) {
      return res.status(400).json({ success: false, message: 'Choose online or physical report delivery.' });
    }

    const idsByType = { test: new Set(), package: new Set() };
    for (const item of items) {
      if (!item || !['test', 'package'].includes(item.itemType) || !mongoose.isValidObjectId(item.itemId)) {
        return res.status(400).json({ success: false, message: 'One or more selected catalogue items are invalid. Please select them again.' });
      }
      idsByType[item.itemType].add(String(item.itemId));
    }

    const [tests, packages] = await Promise.all([
      idsByType.test.size ? Test.find({ _id: { $in: [...idsByType.test] }, isActive: true }).select('name code department') : [],
      idsByType.package.size ? HealthPackage.find({ _id: { $in: [...idsByType.package] }, isActive: true }).select('name code') : [],
    ]);
    const products = {
      test: new Map(tests.map((test) => [String(test._id), test])),
      package: new Map(packages.map((item) => [String(item._id), item])),
    };

    const inquiryItems = [];
    for (const item of items) {
      const product = products[item.itemType].get(String(item.itemId));
      if (!product) {
        return res.status(400).json({ success: false, message: 'A selected item is no longer available in the catalogue. Please refresh and try again.' });
      }
      if (!inquiryItems.some((saved) => saved.itemType === item.itemType && String(saved.itemId) === String(product._id))) {
        inquiryItems.push({
          itemType: item.itemType,
          itemId: product._id,
          name: product.name,
          code: product.code || '',
        });
      }
    }

    const inquiry = await TestInquiry.create({
      trackingId: createTrackingId(),
      patientName,
      phone,
      customerId: req.user?._id || null,
      items: inquiryItems,
      reportDelivery,
    });

    res.status(201).json({
      success: true,
      message: 'Your request was saved. Keep this tracking number to check its status.',
      inquiry: {
        trackingId: inquiry.trackingId,
        patientName: inquiry.patientName,
        items: inquiry.items,
        reportDelivery: inquiry.reportDelivery,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        accountLinked: Boolean(inquiry.customerId),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.trackInquiry = async (req, res, next) => {
  try {
    const trackingId = String(req.params.trackingId || '').trim().toUpperCase();
    const phone = normalizePhone(req.query.phone);
    if (!/^MLR-\d{8}-[A-F0-9]{8}$/.test(trackingId) || phone.length < 7 || phone.length > 15) {
      return res.status(404).json({ success: false, message: 'Request not found. Check the tracking number and phone number.' });
    }

    const inquiry = await TestInquiry.findOne({ trackingId, phone })
      .select('-phone -__v');
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Request not found. Check the tracking number and phone number.' });
    }

    res.status(200).json({ success: true, inquiry });
  } catch (error) {
    next(error);
  }
};

exports.getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await TestInquiry.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    next(error);
  }
};

exports.getInquiries = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { trackingId: { $regex: escaped, $options: 'i' } },
        { patientName: { $regex: escaped, $options: 'i' } },
      ];
      const phoneSearch = normalizePhone(search);
      if (phoneSearch) query.$or.push({ phone: { $regex: phoneSearch, $options: 'i' } });
    }

    const inquiries = await TestInquiry.find(query)
      .select('+phone')
      .sort({ createdAt: -1 })
      .limit(200);
    res.status(200).json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    next(error);
  }
};

exports.updateInquiry = async (req, res, next) => {
  try {
    const { status, confirmedPrice, labResponse } = req.body;
    const allowedStatuses = ['pending_confirmation', 'confirmed', 'unavailable', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Choose a valid request status.' });
    }
    if (confirmedPrice !== undefined && confirmedPrice !== null && (!Number.isFinite(Number(confirmedPrice)) || Number(confirmedPrice) < 0)) {
      return res.status(400).json({ success: false, message: 'Confirmed price must be zero or a positive amount.' });
    }
    if (labResponse !== undefined && String(labResponse).length > 1000) {
      return res.status(400).json({ success: false, message: 'Lab response must be 1000 characters or fewer.' });
    }

    const inquiry = await TestInquiry.findById(req.params.id).select('+phone');
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Test request not found.' });
    }
    if (inquiry.bookingId) {
      return res.status(409).json({ success: false, message: 'This request is already linked to a booking.' });
    }
    inquiry.status = status;
    if (confirmedPrice !== undefined) inquiry.confirmedPrice = confirmedPrice === '' ? null : confirmedPrice;
    if (labResponse !== undefined) inquiry.labResponse = String(labResponse).trim();
    await inquiry.save();

    await logAudit({
      action: 'TEST_INQUIRY_UPDATED',
      entityType: 'TestInquiry',
      entityId: inquiry._id,
      user: req.user,
      details: { trackingId: inquiry.trackingId, status: inquiry.status },
      req,
    });

    res.status(200).json({ success: true, message: 'Test request updated.', inquiry });
  } catch (error) {
    next(error);
  }
};

exports.createBookingFromInquiry = async (req, res, next) => {
  let reservedInquiry = null;
  let createdPatient = null;
  let createdBooking = null;
  let createdSample = null;
  let createdInvoice = null;

  try {
    const inquiry = await TestInquiry.findById(req.params.id).select('+phone');
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Test request not found.' });
    }
    if (inquiry.bookingId) {
      return res.status(409).json({
        success: false,
        message: `This request already has booking ${inquiry.bookingId}.`,
        bookingId: inquiry.bookingId,
      });
    }
    if (inquiry.status !== 'confirmed' || inquiry.confirmedPrice == null) {
      return res.status(409).json({
        success: false,
        message: 'Confirm the request price and availability before creating a booking.',
      });
    }

    const { age, gender, appointmentDate, timeSlot, collectionType, branchId, itemPrices, address } = req.body;
    const parsedAge = Number(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      return res.status(400).json({ success: false, message: 'Enter the patient age (1 to 120).' });
    }
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ success: false, message: 'Choose a valid patient gender.' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(appointmentDate || '')) || Number.isNaN(new Date(`${appointmentDate}T00:00:00`).getTime())) {
      return res.status(400).json({ success: false, message: 'Choose a valid appointment date.' });
    }
    const scheduledDate = new Date(`${appointmentDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (scheduledDate < today) {
      return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past.' });
    }
    if (typeof timeSlot !== 'string' || timeSlot.trim().length < 3 || timeSlot.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Enter a valid appointment time slot.' });
    }
    if (!['home_collection', 'branch_visit'].includes(collectionType)) {
      return res.status(400).json({ success: false, message: 'Choose home collection or branch visit.' });
    }
    if (collectionType === 'home_collection' && (
      typeof address?.street !== 'string' || address.street.trim().length < 3
      || typeof address?.city !== 'string' || address.city.trim().length < 2
    )) {
      return res.status(400).json({ success: false, message: 'Enter the home collection street address and city.' });
    }
    if (collectionType === 'branch_visit' && !mongoose.isValidObjectId(branchId)) {
      return res.status(400).json({ success: false, message: 'Choose a laboratory branch.' });
    }

    if (!Array.isArray(itemPrices) || itemPrices.length !== inquiry.items.length) {
      return res.status(400).json({ success: false, message: 'Enter a confirmed price for every requested item.' });
    }
    const pricesByItemId = new Map();
    for (const entry of itemPrices) {
      const price = Number(entry?.price);
      if (!mongoose.isValidObjectId(entry?.itemId) || !Number.isFinite(price) || price < 0 || pricesByItemId.has(String(entry.itemId))) {
        return res.status(400).json({ success: false, message: 'One or more item prices are invalid.' });
      }
      pricesByItemId.set(String(entry.itemId), price);
    }
    if (inquiry.items.some((item) => !pricesByItemId.has(String(item.itemId)))) {
      return res.status(400).json({ success: false, message: 'Enter a confirmed price for every requested item.' });
    }

    const requestedTestIds = inquiry.items.filter((item) => item.itemType === 'test').map((item) => item.itemId);
    const requestedPackageIds = inquiry.items.filter((item) => item.itemType === 'package').map((item) => item.itemId);
    const [tests, packages, branch, systemSettings] = await Promise.all([
      requestedTestIds.length
        ? Test.find({ _id: { $in: requestedTestIds }, isActive: true }).select('name code sampleType availabilityStatus')
        : [],
      requestedPackageIds.length
        ? HealthPackage.find({ _id: { $in: requestedPackageIds }, isActive: true }).select('name code sampleTypes')
        : [],
      collectionType === 'branch_visit' ? Branch.findOne({ _id: branchId, isActive: true }) : null,
      SystemSettings.findOne(),
    ]);
    if (collectionType === 'branch_visit' && !branch) {
      return res.status(409).json({ success: false, message: 'That branch is unavailable. Choose another branch.' });
    }
    if (collectionType === 'home_collection' && (!systemSettings || systemSettings.homeCollectionFee == null)) {
      return res.status(503).json({ success: false, message: 'Home collection fees are not configured. Choose a branch visit or contact the laboratory.' });
    }

    const products = {
      test: new Map(tests.map((test) => [String(test._id), test])),
      package: new Map(packages.map((item) => [String(item._id), item])),
    };
    const bookingItems = [];
    for (const item of inquiry.items) {
      const product = products[item.itemType].get(String(item.itemId));
      if (!product) {
        return res.status(409).json({ success: false, message: `${item.name} is no longer available in the catalogue.` });
      }
      if (item.itemType === 'test' && product.availabilityStatus && product.availabilityStatus !== 'available') {
        return res.status(409).json({ success: false, message: `${product.name} is not currently available.` });
      }
      bookingItems.push({
        itemType: item.itemType,
        itemId: product._id,
        itemName: product.name,
        itemCode: product.code || '',
        price: pricesByItemId.get(String(item.itemId)),
        sampleType: item.itemType === 'test'
          ? product.sampleType || ''
          : (product.sampleTypes || []).filter(Boolean).join(', '),
      });
    }

    const subtotal = bookingItems.reduce((sum, item) => sum + item.price, 0);
    if (Math.abs(subtotal - Number(inquiry.confirmedPrice)) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Item prices must add up to the confirmed quote of PKR ${inquiry.confirmedPrice}.`,
      });
    }
    const homeCollectionFee = collectionType === 'home_collection'
      ? (systemSettings.freeCollectionThreshold != null && subtotal >= systemSettings.freeCollectionThreshold
        ? 0
        : Number(systemSettings.homeCollectionFee))
      : 0;
    const totalAmount = subtotal + homeCollectionFee;

    reservedInquiry = await TestInquiry.findOneAndUpdate(
      { _id: inquiry._id, status: 'confirmed', bookingId: null },
      { $set: { status: 'appointment_booked' } },
      { new: true },
    ).select('+phone');
    if (!reservedInquiry) {
      return res.status(409).json({ success: false, message: 'This request has already been updated or booked. Refresh the list.' });
    }

    const patientDetails = {
      fullName: inquiry.patientName,
      age: parsedAge,
      gender,
      phone: inquiry.phone,
      email: '',
      address: collectionType === 'home_collection' ? {
        street: address.street.trim(),
        city: address.city.trim(),
        state: typeof address.state === 'string' ? address.state.trim() : '',
        zipCode: typeof address.zipCode === 'string' ? address.zipCode.trim() : '',
      } : {},
    };
    let patient = await Patient.findOne({
      phone: inquiry.phone,
      fullName: inquiry.patientName,
      $or: [{ userId: inquiry.customerId }, { userId: null }],
    }).collation({ locale: 'en', strength: 2 });
    if (!patient) {
      patient = await Patient.create({
        userId: inquiry.customerId || undefined,
        ...patientDetails,
      });
      createdPatient = patient;
    } else {
      patient.age = parsedAge;
      patient.gender = gender;
      if (collectionType === 'home_collection') patient.address = patientDetails.address;
      if (!patient.userId && inquiry.customerId) patient.userId = inquiry.customerId;
      await patient.save();
    }
    if (!patient.patientNumber) {
      patient.patientNumber = `PAT-${await nextSequence({
        key: 'patient',
        Model: Patient,
        field: 'patientNumber',
        prefix: 'PAT-',
      })}`;
      await patient.save();
    }

    const year = new Date().getFullYear();
    const bookingId = `LMS-${year}-${await nextSequence({
      key: `booking-${year}`,
      Model: Booking,
      field: 'bookingId',
      prefix: `LMS-${year}-`,
    })}`;
    createdBooking = await Booking.create({
      bookingId,
      customerId: inquiry.customerId || null,
      patientId: patient._id,
      patientNumber: patient.patientNumber,
      patientDetails,
      collectionType,
      branchId: collectionType === 'branch_visit' ? branch._id : null,
      appointmentDate: scheduledDate,
      timeSlot: timeSlot.trim(),
      items: bookingItems,
      subtotal,
      homeCollectionFee,
      totalAmount,
      paymentStatus: 'pending',
      paymentMethod: collectionType === 'branch_visit' ? 'card_at_branch' : 'cash_on_collection',
      bookingStatus: 'confirmed',
      specialInstructions: `Created from test price request ${inquiry.trackingId}.`,
    });

    const sampleId = `SMP-${year}-${await nextSequence({
      key: `sample-${year}`,
      Model: Sample,
      field: 'sampleId',
      prefix: `SMP-${year}-`,
    })}`;
    createdSample = await Sample.create({
      sampleId,
      barcode: `BC${crypto.randomInt(100000000, 1000000000)}`,
      bookingId: createdBooking._id,
      bookingCode: createdBooking.bookingId,
      testIds: bookingItems.map((item) => item.itemId),
      sampleType: [...new Set(bookingItems.map((item) => item.sampleType).filter(Boolean))].join(', ') || 'Not confirmed',
      currentStage: 'Booking Confirmed',
      statusHistory: [{
        stage: 'Booking Confirmed',
        updatedBy: req.user._id,
        updatedByName: req.user.name,
        location: collectionType === 'home_collection' ? 'Scheduled for Home Phlebotomy' : branch.name,
        remarks: `Appointment confirmed for ${scheduledDate.toDateString()} (${timeSlot.trim()})`,
      }],
    });

    createdInvoice = await Invoice.create({
      invoiceNumber: `INV-${year}-${crypto.randomInt(10000, 100000)}`,
      bookingId: createdBooking._id,
      bookingCode: createdBooking.bookingId,
      customerId: inquiry.customerId || null,
      customerName: patientDetails.fullName,
      customerPhone: patientDetails.phone,
      items: bookingItems.map((item) => ({
        description: item.itemName,
        unitPrice: item.price,
        quantity: 1,
        total: item.price,
      })),
      subtotal,
      homeCollectionFee,
      grandTotal: totalAmount,
      paymentStatus: 'pending',
      paymentMethod: createdBooking.paymentMethod,
    });

    reservedInquiry.bookingId = createdBooking._id;
    await reservedInquiry.save();
    if (inquiry.customerId) {
      try {
        await Notification.create({
          recipientId: inquiry.customerId,
          title: 'Booking Confirmed',
          message: `Your booking #${createdBooking.bookingId} has been confirmed for ${scheduledDate.toDateString()}.`,
          type: 'booking',
          link: `/customer/track/${createdBooking.bookingId}`,
        });
      } catch (notificationError) {
        console.error('[Inquiry booking notification failed]:', notificationError.message);
      }
    }
    await logAudit({
      action: 'TEST_INQUIRY_CONVERTED_TO_BOOKING',
      entityType: 'Booking',
      entityId: createdBooking._id,
      user: req.user,
      details: { trackingId: inquiry.trackingId, bookingId: createdBooking.bookingId, totalAmount },
      req,
    });

    res.status(201).json({
      success: true,
      message: `Booking ${createdBooking.bookingId} created from request ${inquiry.trackingId}.`,
      booking: createdBooking,
      sampleId: createdSample.sampleId,
      invoiceNumber: createdInvoice.invoiceNumber,
    });
  } catch (error) {
    const cleanup = [];
    if (createdInvoice) cleanup.push(Invoice.deleteOne({ _id: createdInvoice._id }));
    if (createdSample) cleanup.push(Sample.deleteOne({ _id: createdSample._id }));
    if (createdBooking) cleanup.push(Booking.deleteOne({ _id: createdBooking._id }));
    if (createdPatient) cleanup.push(Patient.deleteOne({ _id: createdPatient._id }));
    const cleanupResults = await Promise.allSettled(cleanup);
    cleanupResults.filter((result) => result.status === 'rejected').forEach((result) => {
      console.error('[Inquiry booking cleanup failed]:', result.reason.message);
    });
    if (reservedInquiry) {
      try {
        await TestInquiry.updateOne(
          { _id: reservedInquiry._id, status: 'appointment_booked', bookingId: null },
          { $set: { status: 'confirmed' } },
        );
      } catch (resetError) {
        console.error('[Inquiry booking status restore failed]:', resetError.message);
      }
    }
    next(error);
  }
};
