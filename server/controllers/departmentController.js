const mongoose = require('mongoose');
const Department = require('../models/Department');
const Test = require('../models/Test');

exports.getDepartments = async (req, res, next) => {
  try {
    const [departments, testCounts] = await Promise.all([
      Department.find({ isActive: true }).sort({ name: 1 }).lean(),
      Test.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', testCount: { $sum: 1 } } },
      ]),
    ]);
    const countsByDepartment = new Map(testCounts.map(({ _id, testCount }) => [_id, testCount]));
    const activeDepartments = departments.flatMap((department) => {
      const testCount = countsByDepartment.get(department.name) || 0;
      return testCount ? [{ ...department, testCount }] : [];
    });
    res.status(200).json({ success: true, count: activeDepartments.length, departments: activeDepartments });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentTests = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const departmentQuery = mongoose.isValidObjectId(departmentId)
      ? { _id: departmentId, isActive: true }
      : {
        isActive: true,
        $or: [
          { code: departmentId.toUpperCase() },
          { name: new RegExp(`^${departmentId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        ],
      };
    const department = await Department.findOne(departmentQuery).lean();
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const { search = '' } = req.query;
    const query = { department: department.name, isActive: true };
    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const expression = new RegExp(escaped, 'i');
      query.$or = [{ name: expression }, { code: expression }];
    }
    const tests = await Test.find(query).sort({ name: 1 }).lean();
    res.status(200).json({
      success: true,
      department,
      count: tests.length,
      tests,
    });
  } catch (error) {
    next(error);
  }
};
