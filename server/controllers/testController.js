const Test = require('../models/Test');
const TestCategory = require('../models/TestCategory');
const Department = require('../models/Department');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all tests with filters & search
// @route   GET /api/tests
exports.getTests = async (req, res, next) => {
  try {
    const { search, category, department, sampleType, fasting, popular, featured, sort } = req.query;

    const query = { isActive: true };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { code: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { department: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (department) query.department = department;
    if (sampleType) query.sampleType = sampleType;
    if (fasting !== undefined) query.fastingRequired = fasting === 'true';
    if (popular !== undefined) query.popular = popular === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    let sortOptions = { name: 1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'turnaround') sortOptions = { turnaroundHours: 1 };

    const tests = await Test.find(query).sort(sortOptions).populate('availableBranches', 'name code address');

    res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get test by slug or code
// @route   GET /api/tests/:slug
exports.getTestBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const test = await Test.findOne({
      isActive: true,
      $or: [{ slug }, { code: slug.toUpperCase() }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
    }).populate('availableBranches');

    if (!test) {
      return res.status(404).json({ success: false, message: 'Medical test not found' });
    }

    res.status(200).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new test (Admin / Pathologist)
// @route   POST /api/tests
exports.createTest = async (req, res, next) => {
  try {
    const { name, code, description, category, department, price, discountedPrice, sampleType, requiredQuantity, preparation, fastingRequired, fastingHours, turnaroundHours, parameters, popular, featured, availabilityStatus } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const test = await Test.create({
      name,
      code: code.toUpperCase(),
      slug,
      description,
      category,
      department,
      price,
      discountedPrice: discountedPrice || null,
      sampleType,
      requiredQuantity: requiredQuantity || '',
      preparation,
      fastingRequired: fastingRequired ?? null,
      fastingHours: fastingHours ?? null,
      turnaroundHours: turnaroundHours ?? null,
      availabilityStatus: availabilityStatus || 'pending_verification',
      parameters: parameters || [],
      popular: popular || false,
      featured: featured || false,
    });

    await logAudit({
      action: 'TEST_CREATE',
      entityType: 'Test',
      entityId: test._id,
      user: req.user,
      details: { name: test.name, code: test.code },
      req,
    });

    res.status(201).json({ success: true, message: 'Test created successfully', test });
  } catch (error) {
    next(error);
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
exports.updateTest = async (req, res, next) => {
  try {
    let test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await logAudit({
      action: 'TEST_UPDATE',
      entityType: 'Test',
      entityId: test._id,
      user: req.user,
      details: req.body,
      req,
    });

    res.status(200).json({ success: true, message: 'Test updated successfully', test });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate test
// @route   DELETE /api/tests/:id
exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    test.isActive = false;
    await test.save();

    await logAudit({
      action: 'TEST_DEACTIVATE',
      entityType: 'Test',
      entityId: test._id,
      user: req.user,
      details: { name: test.name },
      req,
    });

    res.status(200).json({ success: true, message: 'Test deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all test categories
// @route   GET /api/tests/meta/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await TestCategory.find({ isActive: true }).sort({ displayOrder: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/tests/meta/departments
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};
