const Branch = require('../models/Branch');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all branches
// @route   GET /api/branches
exports.getBranches = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const branches = await Branch.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: branches.length, branches });
  } catch (error) {
    next(error);
  }
};

// @desc    Get branch by ID
// @route   GET /api/branches/:id
exports.getBranchById = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    res.status(200).json({ success: true, branch });
  } catch (error) {
    next(error);
  }
};

// @desc    Create branch (Admin)
// @route   POST /api/branches
exports.createBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);
    await logAudit({
      action: 'BRANCH_CREATE',
      entityType: 'Branch',
      entityId: branch._id,
      user: req.user,
      details: { name: branch.name, code: branch.code },
      req,
    });
    res.status(201).json({ success: true, message: 'Branch created successfully', branch });
  } catch (error) {
    next(error);
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
exports.updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.status(200).json({ success: true, message: 'Branch updated', branch });
  } catch (error) {
    next(error);
  }
};

