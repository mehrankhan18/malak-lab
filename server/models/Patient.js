const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientNumber: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  medicalHistory: [String],
  allergies: [String],
  emergencyContact: {
    name: String,
    relation: String,
    phone: String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Patient', patientSchema);
