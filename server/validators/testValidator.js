/**
 * Input validators for Test and Package management routes
 */

const VALID_SAMPLE_TYPES = [
  'Blood (Serum)',
  'Blood (Whole/EDTA)',
  'Blood (Plasma)',
  'Urine',
  'Stool',
  'Swab',
  'Sputum',
  'CSF',
  'Other',
];

/**
 * Middleware: validate POST/PUT /api/tests
 */
const validateTest = (req, res, next) => {
  const { name, code, category, department, price, sampleType } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.push('Test name is required and must be at least 3 characters.');
  }

  if (!code || typeof code !== 'string' || code.trim().length < 2) {
    errors.push('Test code is required.');
  }

  if (!category || typeof category !== 'string' || category.trim().length < 2) {
    errors.push('Test category is required.');
  }

  if (!department || typeof department !== 'string' || department.trim().length < 2) {
    errors.push('Department is required.');
  }

  const numPrice = Number(price);
  if (price === undefined || isNaN(numPrice) || numPrice < 0) {
    errors.push('Price must be a non-negative number.');
  }

  if (sampleType && !VALID_SAMPLE_TYPES.includes(sampleType)) {
    errors.push(`Sample type must be one of: ${VALID_SAMPLE_TYPES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Test validation failed', errors });
  }

  // Sanitize
  req.body.name = String(name).trim();
  req.body.code = String(code).trim().toUpperCase();

  next();
};

/**
 * Middleware: validate POST /api/packages
 */
const validatePackage = (req, res, next) => {
  const { name, code, originalPrice, packagePrice } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.push('Package name is required and must be at least 3 characters.');
  }

  if (!code || typeof code !== 'string' || code.trim().length < 2) {
    errors.push('Package code is required.');
  }

  const numOriginal = Number(originalPrice);
  const numPackage = Number(packagePrice);

  if (isNaN(numOriginal) || numOriginal < 0) {
    errors.push('Original price must be a non-negative number.');
  }

  if (isNaN(numPackage) || numPackage < 0) {
    errors.push('Package price must be a non-negative number.');
  }

  if (!isNaN(numOriginal) && !isNaN(numPackage) && numPackage > numOriginal) {
    errors.push('Package price should not exceed the original price.');
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Package validation failed', errors });
  }

  req.body.name = String(name).trim();
  req.body.code = String(code).trim().toUpperCase();

  next();
};

/**
 * Middleware: validate POST /api/staff
 */
const validateStaff = (req, res, next) => {
  const { name, email, role } = req.body;
  const errors = [];

  const VALID_ROLES = ['admin', 'pathologist', 'technician', 'receptionist'];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Staff member name is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required for staff login.');
  }

  if (role && !VALID_ROLES.includes(role)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Staff validation failed', errors });
  }

  req.body.name = String(name).trim();
  req.body.email = String(email).toLowerCase().trim();

  next();
};

module.exports = {
  validateTest,
  validatePackage,
  validateStaff,
};
