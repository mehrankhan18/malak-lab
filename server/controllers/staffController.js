const Staff = require('../models/Staff');
const User = require('../models/User');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all staff members (Admin)
// @route   GET /api/staff
exports.getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find().populate('userId', 'name email phone role isActive').populate('assignedBranch');
    res.status(200).json({ success: true, count: staff.length, staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new staff member (Admin)
// @route   POST /api/staff
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, specialization, qualification, licenseNumber, assignedBranch } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // 1. Create User
    const user = await User.create({
      name,
      email,
      password: password || 'StaffPass@2026',
      role: role || 'technician',
    });

    // 2. Generate Employee ID
    const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Create Staff profile
    const staff = await Staff.create({
      userId: user._id,
      employeeId,
      department,
      designation,
      specialization: specialization || '',
      qualification: qualification || '',
      licenseNumber: licenseNumber || '',
      assignedBranch: assignedBranch || null,
    });

    await logAudit({
      action: 'STAFF_CREATE',
      entityType: 'Staff',
      entityId: staff._id,
      user: req.user,
      details: { name: user.name, role: user.role, employeeId },
      req,
    });

    res.status(201).json({ success: true, message: 'Staff member added successfully', staff, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle staff active status (Admin)
// @route   PUT /api/staff/:id/status
exports.toggleStaffStatus = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    staff.isActive = !staff.isActive;
    await staff.save();

    await User.findByIdAndUpdate(staff.userId, { isActive: staff.isActive });

    res.status(200).json({ success: true, message: `Staff status changed to ${staff.isActive ? 'Active' : 'Inactive'}`, staff });
  } catch (error) {
    next(error);
  }
};


// @desc    Update staff member profile details (Admin)
// @route   PUT /api/staff/:id
exports.updateStaff = async (req, res, next) => {
  try {
    const { department, designation, specialization, qualification, licenseNumber, assignedBranch, signatureUrl } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    if (department !== undefined) staff.department = department;
    if (designation !== undefined) staff.designation = designation;
    if (specialization !== undefined) staff.specialization = specialization;
    if (qualification !== undefined) staff.qualification = qualification;
    if (licenseNumber !== undefined) staff.licenseNumber = licenseNumber;
    if (assignedBranch !== undefined) staff.assignedBranch = assignedBranch;
    if (signatureUrl !== undefined) staff.signatureUrl = signatureUrl;

    await staff.save();

    // Also allow updating the linked user's name/phone via staff update
    if (req.body.name || req.body.phone) {
      const userUpdate = {};
      if (req.body.name) userUpdate.name = req.body.name.trim();
      if (req.body.phone) userUpdate.phone = req.body.phone.trim();
      await User.findByIdAndUpdate(staff.userId, userUpdate);
    }

    await logAudit({
      action: 'STAFF_UPDATE',
      entityType: 'Staff',
      entityId: staff._id,
      user: req.user,
      details: { employeeId: staff.employeeId, department, designation },
      req,
    });

    const updatedStaff = await Staff.findById(staff._id)
      .populate('userId', 'name email phone role isActive')
      .populate('assignedBranch', 'name code');

    res.status(200).json({ success: true, message: 'Staff member updated successfully', staff: updatedStaff });
  } catch (error) {
    next(error);
  }
};
