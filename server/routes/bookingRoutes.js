const express = require('express');
const router = express.Router();
const {
  createBooking,
  getCustomerBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validateCreateBooking, validateReschedule } = require('../validators/bookingValidator');

router.post('/', protect, authorize('customer'), validateCreateBooking, createBooking);

router.get('/my', protect, getCustomerBookings);
router.get('/:id', protect, authorize('customer', 'admin', 'pathologist', 'technician', 'receptionist'), getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/reschedule', protect, validateReschedule, rescheduleBooking);

// Admin & Staff operations
router.get('/', protect, authorize('admin', 'pathologist', 'technician', 'receptionist'), getAllBookings);
router.put('/:id/status', protect, authorize('admin', 'pathologist', 'technician', 'receptionist'), updateBookingStatus);

module.exports = router;
