const express = require('express');
const { getDepartments, getDepartmentTests } = require('../controllers/departmentController');

const router = express.Router();

router.get('/', getDepartments);
router.get('/:departmentId/tests', getDepartmentTests);

module.exports = router;
