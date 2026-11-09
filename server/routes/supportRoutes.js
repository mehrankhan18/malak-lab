const express = require('express');
const router = express.Router();
const {
  createTicket,
  getUserTickets,
  getAllTickets,
  replyTicket,
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.post('/', protect, createTicket);
router.get('/my', protect, getUserTickets);
router.get('/', protect, authorize('admin', 'receptionist'), getAllTickets);
router.put('/:id/reply', protect, replyTicket);

module.exports = router;

