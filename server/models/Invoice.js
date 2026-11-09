const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  bookingCode: {
    type: String,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: String,
  customerPhone: String,
  items: [{
    description: String,
    unitPrice: Number,
    quantity: { type: Number, default: 1 },
    total: Number,
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  homeCollectionFee: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'paid',
  },
  paymentMethod: {
    type: String,
    default: 'online',
  },
  transactionId: {
    type: String,
    default: '',
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  paidDate: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Invoice', invoiceSchema);
