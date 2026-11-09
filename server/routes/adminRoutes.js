const express = require('express');
const router = express.Router();
const { getDashboardStats, getPatients, togglePatientStatus, getAuditLogs } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const catalogAdminController = require('../controllers/catalogAdminController');
const inquiryController = require('../controllers/inquiryController');

router.use(protect, authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/patients', getPatients);
router.put('/patients/:id/toggle-status', togglePatientStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/inquiries', inquiryController.getInquiries);
router.patch('/inquiries/:id', inquiryController.updateInquiry);
router.post('/inquiries/:id/booking', inquiryController.createBookingFromInquiry);

router.get('/tests', catalogAdminController.getTests);
router.post('/tests', catalogAdminController.createTest);
router.post('/tests/bulk-import', catalogAdminController.bulkImportTests);
router.put('/tests/:id', catalogAdminController.updateTest);
router.patch('/tests/:id/status', catalogAdminController.setTestStatus);
router.delete('/tests/:id', catalogAdminController.deleteTest);

router.get('/departments', catalogAdminController.getAdminDepartments);
router.post('/departments', catalogAdminController.createDepartment);
router.put('/departments/:id', catalogAdminController.updateDepartment);
router.delete('/departments/:id', catalogAdminController.deleteDepartment);

module.exports = router;
