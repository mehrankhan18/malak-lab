const HealthPackage = require('../models/HealthPackage');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all health packages
// @route   GET /api/packages
exports.getPackages = async (req, res, next) => {
  try {
    const { popular, featured, search } = req.query;
    const query = { isActive: true };

    if (popular !== undefined) query.popular = popular === 'true';
    if (featured !== undefined) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const packages = await HealthPackage.find(query).populate('testsIncluded');
    res.status(200).json({ success: true, count: packages.length, packages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get package by slug or ID
// @route   GET /api/packages/:slug
exports.getPackageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const pkg = await HealthPackage.findOne({
      $or: [{ slug }, { code: slug.toUpperCase() }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
    }).populate('testsIncluded');

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Health package not found' });
    }

    res.status(200).json({ success: true, package: pkg });
  } catch (error) {
    next(error);
  }
};

// @desc    Create health package
// @route   POST /api/packages
exports.createPackage = async (req, res, next) => {
  try {
    const { name, code, description, tagline, testsIncluded, originalPrice, packagePrice, fastingRequirements, sampleTypes, popular, featured } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const discountPercentage = originalPrice > 0 ? Math.round(((originalPrice - packagePrice) / originalPrice) * 100) : 0;

    const pkg = await HealthPackage.create({
      name,
      slug,
      code: code.toUpperCase(),
      tagline,
      description,
      testsIncluded: testsIncluded || [],
      testCount: testsIncluded ? testsIncluded.length : 0,
      originalPrice,
      packagePrice,
      discountPercentage,
      sampleTypes: sampleTypes || ['Blood (Serum)', 'Urine'],
      fastingRequirements,
      popular: popular || false,
      featured: featured || false,
    });

    await logAudit({
      action: 'PACKAGE_CREATE',
      entityType: 'HealthPackage',
      entityId: pkg._id,
      user: req.user,
      details: { name: pkg.name },
      req,
    });

    res.status(201).json({ success: true, message: 'Package created successfully', package: pkg });
  } catch (error) {
    next(error);
  }
};

// @desc    Update health package
// @route   PUT /api/packages/:id
exports.updatePackage = async (req, res, next) => {
  try {
    const pkg = await HealthPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.status(200).json({ success: true, message: 'Package updated', package: pkg });
  } catch (error) {
    next(error);
  }
};

