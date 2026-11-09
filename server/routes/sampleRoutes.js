const express = require('express');
const router = express.Router();
const {
  trackSample,
  getSamples,
  updateSampleStage,
  registerSample,
} = require('../controllers/sampleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Public tracker route
router.get('/track/:query', trackSample);

// Staff & Admin routes
router.get('/', protect, authorize('admin', 'pathologist', 'technician', 'receptionist'), getSamples);
router.post('/register', protect, authorize('admin', 'technician', 'receptionist'), registerSample);
router.put('/:id/stage', protect, authorize('admin', 'pathologist', 'technician'), updateSampleStage);

module.exports = router;

