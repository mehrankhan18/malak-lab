const mongoose = require('mongoose');

const sampleStatusHistorySchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: [
      'Booking Confirmed',
      'Sample Collection Scheduled',
      'Sample Collected',
      'Sample Received',
      'Testing in Progress',
      'Report Under Review',
      'Report Approved',
      'Report Published'
    ],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedByName: {
    type: String,
    default: 'System',
  },
  location: {
    type: String,
    default: 'Central Laboratory',
  },
  remarks: {
    type: String,
    default: '',
  }
});

const sampleSchema = new mongoose.Schema({
  sampleId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  barcode: {
    type: String,
    required: true,
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
  testIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
  }],
  sampleType: {
    type: String,
    required: true,
  },
  collectedAt: {
    type: Date,
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  collectorName: {
    type: String,
    default: '',
  },
  receivedAtLab: {
    type: Date,
  },
  currentStage: {
    type: String,
    enum: [
      'Booking Confirmed',
      'Sample Collection Scheduled',
      'Sample Collected',
      'Sample Received',
      'Testing in Progress',
      'Report Under Review',
      'Report Approved',
      'Report Published'
    ],
    default: 'Booking Confirmed',
  },
  statusHistory: [sampleStatusHistorySchema],
  tubeColor: {
    type: String,
    default: 'Lavender (EDTA)',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  isRejected: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Sample', sampleSchema);
