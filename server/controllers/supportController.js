const SupportTicket = require('../models/SupportTicket');

exports.createTicket = async (req, res, next) => {
  try {
    const { subject, category, priority, message } = req.body;
    const ticketId = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket = await SupportTicket.create({
      ticketId,
      userId: req.user.id,
      subject,
      category,
      priority: priority || 'Medium',
      messages: [{
        senderId: req.user.id,
        senderName: req.user.name,
        senderRole: req.user.role,
        message,
        timestamp: new Date(),
      }],
    });

    res.status(201).json({ success: true, message: 'Support ticket submitted', ticket });
  } catch (error) {
    next(error);
  }
};

exports.getUserTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    next(error);
  }
};

exports.getAllTickets = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const tickets = await SupportTicket.find(query).sort({ updatedAt: -1 }).populate('userId', 'name email phone');
    res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    next(error);
  }
};

exports.replyTicket = async (req, res, next) => {
  try {
    const { message, status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.messages.push({
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
      timestamp: new Date(),
    });

    if (status) ticket.status = status;
    await ticket.save();

    res.status(200).json({ success: true, message: 'Reply sent', ticket });
  } catch (error) {
    next(error);
  }
};

