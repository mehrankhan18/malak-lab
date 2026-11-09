const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  labName: {
    type: String,
    default: 'MALAK Lab Science Hub',
  },
  tagline: {
    type: String,
    default: 'Laboratory testing in Timergara, Lower Dir',
  },
  contactEmail: {
    type: String,
    default: '',
  },
  contactPhone: {
    type: String,
    default: '0328 5027351',
  },
  emergencyPhone: {
    type: String,
    default: '',
  },
  headquarters: {
    address: { type: String, default: 'Opposite DHQ Hospital, Main GT Road' },
    city: { type: String, default: 'Timergara' },
    state: { type: String, default: 'Lower Dir' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'Pakistan' },
  },
  currency: {
    type: String,
    default: 'PKR',
  },
  homeCollectionFee: {
    type: Number,
    default: null,
  },
  freeCollectionThreshold: {
    type: Number,
    default: null,
  },
  nablLicenseNumber: {
    type: String,
    default: '',
  },
  cliaNumber: {
    type: String,
    default: '',
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true,
  },
  smsNotificationsEnabled: {
    type: Boolean,
    default: true,
  },
  autoPublishApprovedReports: {
    type: Boolean,
    default: true,
  },
  allowCustomerCancellations: {
    type: Boolean,
    default: true,
  },
  cancellationWindowHours: {
    type: Number,
    default: 4,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
