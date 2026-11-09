const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  parameterName: { type: String, required: true },
  unit: { type: String, default: '' },
  referenceRange: { type: String, default: '' },
  maleRange: { type: String, default: '' },
  femaleRange: { type: String, default: '' },
  childRange: { type: String, default: '' },
  criticalLow: { type: Number },
  criticalHigh: { type: Number },
  method: { type: String, default: '' },
});

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide test name'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Please provide test code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    default: null,
  },
  discountedPrice: {
    type: Number,
    default: null,
  },
  sampleType: {
    type: String,
    trim: true,
    default: null,
  },
  requiredQuantity: {
    type: String,
    default: '',
  },
  preparation: {
    type: String,
    default: '',
  },
  fastingRequired: {
    type: Boolean,
    default: null,
  },
  fastingHours: {
    type: Number,
    default: null,
  },
  turnaroundHours: {
    type: Number,
    min: 0,
    default: null,
  },
  availabilityStatus: {
    type: String,
    enum: ['pending_verification', 'available', 'unavailable'],
    default: 'available',
  },
  parameters: [parameterSchema],
  availableBranches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  }],
  popular: {
    type: Boolean,
    default: false,
  },
  featured: {
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

testSchema.index(
  { department: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
    collation: { locale: 'en', strength: 2 },
  }
);

module.exports = mongoose.model('Test', testSchema);
