const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    default: '',
  },
  qualification: {
    type: String,
    default: '',
  },
  licenseNumber: {
    type: String,
    default: '',
  },
  signatureUrl: {
    type: String,
    default: '',
  },
  assignedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  permissions: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Staff', staffSchema);

