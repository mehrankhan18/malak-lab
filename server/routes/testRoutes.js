const express = require('express');
const router = express.Router();
const {
  getTests,
  getTestBySlug,
  createTest,
  updateTest,
  deleteTest,
  getCategories,
  getDepartments,
} = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validateTest } = require('../validators/testValidator');

// Public catalog routes
router.get('/meta/categories', getCategories);
router.get('/meta/departments', getDepartments);
router.get('/search', getTests);
router.get('/', getTests);

// Admin / Pathologist management routes
router.post('/', protect, authorize('admin', 'pathologist'), validateTest, createTest);
router.put('/:id', protect, authorize('admin', 'pathologist'), updateTest);
router.delete('/:id', protect, authorize('admin'), deleteTest);
router.get('/:slug', getTestBySlug);

module.exports = router;
