const mongoose = require('mongoose');

const healthPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  tagline: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: true,
  },
  testsIncluded: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
  }],
  testCount: {
    type: Number,
    default: 0,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  packagePrice: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  sampleTypes: [{
    type: String,
  }],
  fastingRequirements: {
    type: String,
    default: '10-12 hours overnight fasting recommended.',
  },
  targetDemographic: {
    type: String,
    default: 'All Adults (Men & Women)',
  },
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

module.exports = mongoose.model('HealthPackage', healthPackageSchema);

