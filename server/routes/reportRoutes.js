const express = require('express');
const router = express.Router();
const {
  getReports,
  getCustomerReports,
  getReportById,
  createDraftReport,
  updateReportResults,
  submitForReview,
  approveAndPublishReport,
  downloadReportPDF,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Patients can download only their own published reports; staff may access reports by role.
router.get('/:id/pdf', protect, authorize('customer', 'admin', 'pathologist', 'technician'), downloadReportPDF);

// Customer reports
router.get('/customer', protect, getCustomerReports);

// Single report view
router.get('/:id', protect, authorize('customer', 'admin', 'pathologist', 'technician'), getReportById);

// Staff & Admin operations
router.get('/', protect, authorize('admin', 'pathologist', 'technician'), getReports);
router.post('/', protect, authorize('admin', 'technician'), createDraftReport);
router.put('/:id/results', protect, authorize('admin', 'technician', 'pathologist'), updateReportResults);
router.put('/:id/submit-review', protect, authorize('admin', 'technician'), submitForReview);
// Only certified pathologist or admin can approve and publish
router.put('/:id/approve', protect, authorize('admin', 'pathologist'), approveAndPublishReport);

module.exports = router;
