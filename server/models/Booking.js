const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['test', 'package'],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  itemCode: {
    type: String,
    default: '',
  },
  sampleType: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
});

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },
  patientNumber: {
    type: String,
    default: '',
  },
  patientDetails: {
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      landmark: String,
    }
  },
  collectionType: {
    type: String,
    enum: ['home_collection', 'branch_visit'],
    required: true,
    default: 'home_collection',
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: false,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  items: [bookingItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  homeCollectionFee: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
    default: '',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash_on_collection', 'card_at_branch', 'demo_paid'],
    default: 'cash_on_collection',
  },
  transactionId: {
    type: String,
    default: '',
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'rescheduled', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  assignedCollector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  specialInstructions: {
    type: String,
    default: '',
  },
  cancellationReason: {
    type: String,
    default: '',
  },
  rescheduledHistory: [{
    previousDate: Date,
    previousSlot: String,
    rescheduledAt: Date,
    reason: String,
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
