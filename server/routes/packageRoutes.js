const express = require('express');
const router = express.Router();
const {
  getPackages,
  getPackageBySlug,
  createPackage,
  updatePackage,
} = require('../controllers/packageController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', getPackages);
router.get('/:slug', getPackageBySlug);
router.post('/', protect, authorize('admin', 'pathologist'), createPackage);
router.put('/:id', protect, authorize('admin', 'pathologist'), updatePackage);

module.exports = router;

