const express = require('express');
const router = express.Router();
const { getBranches, getBranchById, createBranch, updateBranch } = require('../controllers/branchController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', getBranches);
router.get('/:id', getBranchById);
router.post('/', protect, authorize('admin'), createBranch);
router.put('/:id', protect, authorize('admin'), updateBranch);

module.exports = router;

