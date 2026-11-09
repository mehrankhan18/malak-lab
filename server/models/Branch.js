const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  address: {
    street: { type: String, required: true },
    area: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, default: '' },
  },
  phone: {
    type: String,
    required: true,
  },
  emergencyPhone: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  openingHours: {
    monFri: { type: String, default: '' },
    saturday: { type: String, default: '' },
    sunday: { type: String, default: '' },
  },
  managerName: {
    type: String,
    default: '',
  },
  services: [String],
  hasParking: {
    type: Boolean,
    default: true,
  },
  isNablAccredited: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Branch', branchSchema);
