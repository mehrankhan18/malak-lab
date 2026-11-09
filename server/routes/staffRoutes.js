const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff, toggleStaffStatus } = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validateStaff } = require('../validators/testValidator');

// All staff management routes require admin role
router.use(protect, authorize('admin'));

router.get('/', getStaff);
router.post('/', validateStaff, createStaff);
router.put('/:id', updateStaff);
router.put('/:id/status', toggleStaffStatus);

module.exports = router;
