const mongoose = require('mongoose');

const reportResultItemSchema = new mongoose.Schema({
  parameterName: { type: String, required: true },
  resultValue: { type: String, required: true },
  unit: { type: String, default: '' },
  referenceRange: { type: String, default: '' },
  flag: {
    type: String,
    enum: ['Normal', 'High', 'Low', 'Critical', 'Abnormal'],
    default: 'Normal',
  },
  remarks: { type: String, default: '' },
});

const reportAuditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  modifierName: { type: String, default: '' },
  modifierRole: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  changesSummary: { type: String, default: '' },
});

const laboratoryReportSchema = new mongoose.Schema({
  reportId: {
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
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },
  patientNumber: {
    type: String,
    default: '',
  },
  patientInfo: {
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  testName: {
    type: String,
    required: true,
  },
  testCategory: {
    type: String,
    default: 'Clinical Pathology',
  },
  department: {
    type: String,
    default: 'Biochemistry',
  },
  sampleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sample',
  },
  sampleCode: {
    type: String,
    default: '',
  },
  sampleType: {
    type: String,
    default: 'Blood (Serum)',
  },
  collectedAt: {
    type: Date,
  },
  receivedAt: {
    type: Date,
  },
  reportedAt: {
    type: Date,
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  technicianName: {
    type: String,
    default: '',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  pathologistName: {
    type: String,
    default: '',
  },
  pathologistQualifications: {
    type: String,
    default: 'MBBS, MD (Pathology)',
  },
  results: [reportResultItemSchema],
  clinicalImpression: {
    type: String,
    default: 'Results correlate with clinical findings.',
  },
  overallRemarks: {
    type: String,
    default: 'Kindly correlate clinically. Repeat test advised if discordant with clinical picture.',
  },
  status: {
    type: String,
    enum: ['draft', 'submitted_for_review', 'approved', 'published', 'rejected'],
    default: 'draft',
  },
  approvedAt: {
    type: Date,
  },
  publishedAt: {
    type: Date,
  },
  isDeliveredToPatient: {
    type: Boolean,
    default: false,
  },
  auditHistory: [reportAuditSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('LaboratoryReport', laboratoryReportSchema);
