const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  senderName: String,
  senderRole: String,
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Report Inquiry', 'Appointment Reschedule', 'Payment Issue', 'Home Collection Delay', 'Other'],
    default: 'Report Inquiry',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  messages: [ticketMessageSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

