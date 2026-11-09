const mongoose = require('mongoose');

const inquiryItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['test', 'package'],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    default: '',
  },
}, { _id: false });

const testInquirySchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true,
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: true,
    select: false,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
  items: {
    type: [inquiryItemSchema],
    validate: [(items) => items.length > 0 && items.length <= 25, 'Select between 1 and 25 tests or packages.'],
  },
  reportDelivery: {
    type: String,
    enum: ['online', 'physical'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending_confirmation', 'confirmed', 'unavailable', 'appointment_booked', 'completed'],
    default: 'pending_confirmation',
    index: true,
  },
  confirmedPrice: {
    type: Number,
    min: 0,
    default: null,
  },
  labResponse: {
    type: String,
    default: '',
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TestInquiry', testInquirySchema);
