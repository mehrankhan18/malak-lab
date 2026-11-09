const mongoose = require('mongoose');
const Test = require('../models/Test');
const Department = require('../models/Department');
const { logAudit } = require('../middleware/auditMiddleware');

const availabilityStatuses = ['pending_verification', 'available', 'unavailable'];
const testFields = [
  'name',
  'code',
  'slug',
  'description',
  'category',
  'department',
  'price',
  'discountedPrice',
  'sampleType',
  'requiredQuantity',
  'preparation',
  'fastingRequired',
  'fastingHours',
  'turnaroundHours',
  'availabilityStatus',
  'popular',
  'featured',
  'parameters',
];

const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const activeNameConflict = async (name, department, excludeId) => Test.findOne({
  name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
  department,
  isActive: true,
  ...(excludeId ? { _id: { $ne: excludeId } } : {}),
}).select('_id').lean();

const parseOptionalNumber = (value, label, errors) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    errors.push(`${label} must be a non-negative number or blank.`);
    return undefined;
  }
  return parsed;
};

function normalizeTest(payload, { create = false } = {}) {
  const errors = [];
  const data = {};
  for (const field of testFields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) data[field] = payload[field];
  }

  if (create || data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('Test name is required and must be at least 2 characters.');
    } else {
      data.name = data.name.trim();
    }
  }

  if (create || data.code !== undefined) {
    if (typeof data.code !== 'string' || data.code.trim().length < 2) {
      errors.push('A unique test code is required.');
    } else {
      data.code = data.code.trim().toUpperCase();
    }
  }

  if (create || data.department !== undefined) {
    if (typeof data.department !== 'string' || data.department.trim().length < 2) {
      errors.push('Department is required.');
    } else {
      data.department = data.department.trim();
    }
  }

  for (const field of ['description', 'category', 'sampleType', 'requiredQuantity', 'preparation']) {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'string') {
      errors.push(`${field} must be text.`);
    } else if (typeof data[field] === 'string') {
      data[field] = data[field].trim();
    }
  }

  for (const field of ['price', 'discountedPrice', 'fastingHours', 'turnaroundHours']) {
    if (data[field] !== undefined) {
      const label = field === 'turnaroundHours' ? 'Report delivery time' : field;
      data[field] = parseOptionalNumber(data[field], label, errors);
    }
  }

  if (data.fastingRequired !== undefined && data.fastingRequired !== null && typeof data.fastingRequired !== 'boolean') {
    errors.push('Fasting requirement must be true, false, or blank.');
  }

  if (data.availabilityStatus !== undefined && !availabilityStatuses.includes(data.availabilityStatus)) {
    errors.push(`Availability must be one of: ${availabilityStatuses.join(', ')}.`);
  }

  if (data.parameters !== undefined && !Array.isArray(data.parameters)) {
    errors.push('Parameters must be an array.');
  }

  if (create || data.name !== undefined || data.department !== undefined) {
    if (data.name && data.department) {
      data.slug = `${slugify(data.department)}-${slugify(data.name)}`;
    }
  }
  if (data.category === undefined && data.department !== undefined) {
    data.category = data.department;
  }
  if (data.code !== undefined) {
    data.code = data.code.toUpperCase();
  }

  return { data, errors };
}

exports.getTests = async (req, res, next) => {
  try {
    const { search = '', department, availabilityStatus, active } = req.query;
    const query = {};
    if (department) query.department = department;
    if (availabilityStatus) query.availabilityStatus = availabilityStatus;
    if (active === 'true' || active === 'false') query.isActive = active === 'true';
    if (search.trim()) {
      const expression = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [{ name: expression }, { code: expression }, { department: expression }];
    }

    const tests = await Test.find(query).sort({ department: 1, name: 1 }).lean();
    res.status(200).json({ success: true, count: tests.length, tests });
  } catch (error) {
    next(error);
  }
};

exports.createTest = async (req, res, next) => {
  try {
    const { data, errors } = normalizeTest(req.body, { create: true });
    if (errors.length) {
      return res.status(422).json({ success: false, message: 'Test validation failed.', errors });
    }

    const department = await Department.findOne({ name: data.department, isActive: true });
    if (!department) {
      return res.status(422).json({ success: false, message: 'Choose an active department.' });
    }
    if (await activeNameConflict(data.name, data.department)) {
      return res.status(409).json({ success: false, message: 'An active test with this name already exists in the selected department.' });
    }

    const test = await Test.create({
      ...data,
      availabilityStatus: data.availabilityStatus || 'pending_verification',
    });
    await logAudit({
      action: 'TEST_CREATE',
      entityType: 'Test',
      entityId: test._id,
      user: req.user,
      details: { name: test.name, code: test.code },
      req,
    });
    res.status(201).json({ success: true, message: 'Test created successfully.', test });
  } catch (error) {
    next(error);
  }
};

exports.updateTest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid test ID.' });
    }
    const { data, errors } = normalizeTest(req.body);
    if (errors.length) {
      return res.status(422).json({ success: false, message: 'Test validation failed.', errors });
    }
    if (data.department && !(await Department.exists({ name: data.department, isActive: true }))) {
      return res.status(422).json({ success: false, message: 'Choose an active department.' });
    }
    if (data.name && data.department && await activeNameConflict(data.name, data.department, req.params.id)) {
      return res.status(409).json({ success: false, message: 'An active test with this name already exists in the selected department.' });
    }

    const test = await Test.findByIdAndUpdate(req.params.id, { $set: data }, {
      new: true,
      runValidators: true,
    });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });

    await logAudit({
      action: 'TEST_UPDATE',
      entityType: 'Test',
      entityId: test._id,
      user: req.user,
      details: { fields: Object.keys(data) },
      req,
    });
    res.status(200).json({ success: true, message: 'Test updated successfully.', test });
  } catch (error) {
    next(error);
  }
};

exports.setTestStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid test ID.' });
    }
    const update = {};
    if (typeof req.body.isActive === 'boolean') update.isActive = req.body.isActive;
    if (availabilityStatuses.includes(req.body.availabilityStatus)) {
      update.availabilityStatus = req.body.availabilityStatus;
    }
    if (!Object.keys(update).length) {
      return res.status(422).json({
        success: false,
        message: 'Provide isActive or a valid availabilityStatus.',
      });
    }

    const test = await Test.findByIdAndUpdate(req.params.id, { $set: update }, {
      new: true,
      runValidators: true,
    });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });

    await logAudit({
      action: 'TEST_STATUS_UPDATE',
      entityType: 'Test',
      entityId: test._id,
      user: req.user,
      details: update,
      req,
    });
    res.status(200).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

exports.deleteTest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid test ID.' });
    }
    const test = await Test.findByIdAndUpdate(req.params.id, {
      $set: { isActive: false, availabilityStatus: 'unavailable' },
    }, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });

    await logAudit({
      action: 'TEST_DEACTIVATE',
      entityType: 'Test',
      entityId: test._id,
      user: req.user,
      details: { name: test.name, code: test.code },
      req,
    });
    res.status(200).json({ success: true, message: 'Test deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.bulkImportTests = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.tests) || req.body.tests.length === 0) {
      return res.status(422).json({ success: false, message: 'Provide a non-empty tests array.' });
    }
    if (req.body.tests.length > 1000) {
      return res.status(413).json({ success: false, message: 'Import is limited to 1,000 tests per request.' });
    }

    const importedCodes = new Set();
    const errors = [];
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const [index, row] of req.body.tests.entries()) {
      const rowNumber = index + 1;
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        errors.push({ row: rowNumber, message: 'Each row must be an object.' });
        skipped += 1;
        continue;
      }

      const departmentName = String(row.department || '').trim();
      const department = departmentName
        ? await Department.findOne({ name: departmentName, isActive: true })
        : null;
      if (!department) {
        errors.push({ row: rowNumber, message: `Unknown or inactive department: ${departmentName || '(blank)'}.` });
        skipped += 1;
        continue;
      }

      const name = String(row.name || '').trim();
      const code = String(row.code || `CAT-${department.code}-${slugify(name)}`).toUpperCase();
      const candidate = { ...row, name, code, department: department.name };
      const { data, errors: rowErrors } = normalizeTest(candidate, { create: true });
      if (rowErrors.length) {
        errors.push({ row: rowNumber, message: rowErrors.join(' ') });
        skipped += 1;
        continue;
      }
      if (importedCodes.has(data.code)) {
        errors.push({ row: rowNumber, message: `Duplicate test code in this file: ${data.code}.` });
        skipped += 1;
        continue;
      }
      importedCodes.add(data.code);

      const duplicateName = await activeNameConflict(data.name, data.department);
      if (duplicateName && !(await Test.exists({ _id: duplicateName._id, code: data.code }))) {
        errors.push({
          row: rowNumber,
          message: `An active test named "${data.name}" already exists in ${data.department}.`,
        });
        skipped += 1;
        continue;
      }

      const insertDefaults = {
        description: '',
        price: null,
        discountedPrice: null,
        sampleType: null,
        requiredQuantity: '',
        preparation: '',
        fastingRequired: null,
        fastingHours: null,
        turnaroundHours: null,
        availabilityStatus: 'pending_verification',
        isActive: true,
        popular: false,
        featured: false,
        parameters: [],
      };

      try {
        const existed = await Test.exists({ code: data.code });
        await Test.findOneAndUpdate(
          { code: data.code },
          { $set: data, $setOnInsert: insertDefaults },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        if (existed) updated += 1;
        else imported += 1;
      } catch (error) {
        errors.push({ row: rowNumber, message: error.message });
        skipped += 1;
      }
    }

    await logAudit({
      action: 'TEST_BULK_IMPORT',
      entityType: 'Test',
      user: req.user,
      details: { imported, updated, skipped, errorCount: errors.length },
      req,
    });
    res.status(errors.length ? 207 : 200).json({
      success: errors.length === 0,
      imported,
      updated,
      skipped,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const code = String(req.body.code || '').trim().toUpperCase();
    if (name.length < 2 || code.length < 2) {
      return res.status(422).json({ success: false, message: 'Department name and code are required.' });
    }

    const department = await Department.create({
      name,
      code,
      description: String(req.body.description || '').trim(),
      icon: String(req.body.icon || 'Activity').trim(),
      isActive: true,
    });
    await logAudit({
      action: 'DEPARTMENT_CREATE',
      entityType: 'Department',
      entityId: department._id,
      user: req.user,
      details: { name, code },
      req,
    });
    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid department ID.' });
    }
    const allowed = ['name', 'code', 'description', 'icon', 'isActive'];
    const update = Object.fromEntries(
      Object.entries(req.body)
        .filter(([key]) => allowed.includes(key))
        .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    );
    if (typeof update.code === 'string') update.code = update.code.toUpperCase();
    if (update.name !== undefined && update.name.length < 2) {
      return res.status(422).json({ success: false, message: 'Department name must be at least 2 characters.' });
    }
    if (update.code !== undefined && update.code.length < 2) {
      return res.status(422).json({ success: false, message: 'Department code must be at least 2 characters.' });
    }
    if (!Object.keys(update).length) {
      return res.status(422).json({ success: false, message: 'No department fields provided.' });
    }

    const previousDepartment = await Department.findById(req.params.id);
    if (!previousDepartment) return res.status(404).json({ success: false, message: 'Department not found.' });

    const department = await Department.findByIdAndUpdate(req.params.id, { $set: update }, {
      new: true,
      runValidators: true,
    });
    if (update.name && update.name !== previousDepartment.name) {
      await Test.updateMany(
        { department: previousDepartment.name, category: previousDepartment.name },
        { $set: { department: update.name, category: update.name } }
      );
      await Test.updateMany(
        { department: previousDepartment.name },
        { $set: { department: update.name } }
      );
    }
    await logAudit({
      action: 'DEPARTMENT_UPDATE',
      entityType: 'Department',
      entityId: department._id,
      user: req.user,
      details: update,
      req,
    });
    res.status(200).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid department ID.' });
    }
    const department = await Department.findByIdAndUpdate(req.params.id, {
      $set: { isActive: false },
    }, { new: true });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found.' });
    await logAudit({
      action: 'DEPARTMENT_DEACTIVATE',
      entityType: 'Department',
      entityId: department._id,
      user: req.user,
      details: { name: department.name, code: department.code },
      req,
    });
    res.status(200).json({ success: true, message: 'Department deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};
