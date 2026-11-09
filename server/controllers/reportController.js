const LaboratoryReport = require('../models/LaboratoryReport');
const Booking = require('../models/Booking');
const Test = require('../models/Test');
const Sample = require('../models/Sample');
const Notification = require('../models/Notification');
const { generateReportPDF } = require('../services/pdfService');
const { sendReportReadyEmail } = require('../services/emailService');
const { logAudit } = require('../middleware/auditMiddleware');

// Generate unique Report ID
const generateReportId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `REP-${year}-${rand}`;
};

// @desc    Get all reports (Admin / Pathologist / Technician)
// @route   GET /api/reports
exports.getReports = async (req, res, next) => {
  try {
    const { status, search, department } = req.query;
    const query = {};

    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { reportId: { $regex: search, $options: 'i' } },
        { bookingCode: { $regex: search, $options: 'i' } },
        { 'patientInfo.fullName': { $regex: search, $options: 'i' } },
        { testName: { $regex: search, $options: 'i' } },
      ];
    }

    const reports = await LaboratoryReport.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer reports
// @route   GET /api/reports/customer
exports.getCustomerReports = async (req, res, next) => {
  try {
    // Find customer's bookings first
    const customerBookings = await Booking.find({ customerId: req.user.id }).select('_id');
    const bookingIds = customerBookings.map(b => b._id);

    // Only return published or approved reports to patients
    const reports = await LaboratoryReport.find({
      bookingId: { $in: bookingIds },
      status: { $in: ['published', 'approved'] },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
exports.getReportById = async (req, res, next) => {
  try {
    const report = await LaboratoryReport.findOne({
      $or: [
        { reportId: req.params.id.toUpperCase() },
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      ],
    }).populate('conductedBy').populate('verifiedBy');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Laboratory report not found' });
    }

    // Security check: if customer, verify ownership and published status
    if (req.user && req.user.role === 'customer') {
      const booking = await Booking.findById(report.bookingId);
      if (!booking || String(booking.customerId) !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied to this report.' });
      }
      if (!['published', 'approved'].includes(report.status)) {
        return res.status(403).json({ success: false, message: 'This report is currently under review and not yet released.' });
      }
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Initialize draft report for a test
// @route   POST /api/reports
exports.createDraftReport = async (req, res, next) => {
  try {
    const { bookingId, testId, sampleId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    // Pre-populate parameter list from Test model
    const initialResults = (test.parameters || []).map(p => ({
      parameterName: p.parameterName,
      resultValue: '',
      unit: p.unit,
      referenceRange: p.referenceRange || (p.maleRange ? `M: ${p.maleRange} | F: ${p.femaleRange}` : 'Normal'),
      flag: 'Normal',
      remarks: '',
    }));

    const reportId = generateReportId();

    const report = await LaboratoryReport.create({
      reportId,
      bookingId: booking._id,
      bookingCode: booking.bookingId,
      patientId: booking.patientId,
      patientNumber: booking.patientNumber || '',
      patientInfo: {
        fullName: booking.patientDetails.fullName,
        age: booking.patientDetails.age,
        gender: booking.patientDetails.gender,
        phone: booking.patientDetails.phone,
        email: booking.patientDetails.email || '',
        address: `${booking.patientDetails.address?.street || ''}, ${booking.patientDetails.address?.city || ''}`,
      },
      testId: test._id,
      testName: test.name,
      testCategory: test.category,
      department: test.department,
      sampleId: sampleId || null,
      sampleType: test.sampleType,
      results: initialResults,
      status: 'draft',
      conductedBy: req.user ? req.user._id : null,
      technicianName: req.user ? req.user.name : 'Lab Technologist',
      auditHistory: [{
        action: 'REPORT_INITIALIZED',
        modifiedBy: req.user ? req.user._id : null,
        modifierName: req.user ? req.user.name : 'Staff',
        modifierRole: req.user ? req.user.role : 'technician',
        changesSummary: 'Draft report created for testing',
      }]
    });

    res.status(201).json({ success: true, message: 'Draft report initialized', report });
  } catch (error) {
    next(error);
  }
};

// @desc    Enter or update test results (Technician / Pathologist)
// @route   PUT /api/reports/:id/results
exports.updateReportResults = async (req, res, next) => {
  try {
    const { results, clinicalImpression, overallRemarks } = req.body;
    const report = await LaboratoryReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.status === 'published' && req.user.role !== 'admin' && req.user.role !== 'pathologist') {
      return res.status(403).json({ success: false, message: 'Published reports can only be amended by a pathologist or admin.' });
    }

    if (results) report.results = results;
    if (clinicalImpression !== undefined) report.clinicalImpression = clinicalImpression;
    if (overallRemarks !== undefined) report.overallRemarks = overallRemarks;

    report.auditHistory.push({
      action: 'RESULTS_ENTERED_UPDATED',
      modifiedBy: req.user ? req.user._id : null,
      modifierName: req.user ? req.user.name : 'Technician',
      modifierRole: req.user ? req.user.role : 'technician',
      changesSummary: `Updated ${results ? results.length : 0} parameter results`,
    });

    await report.save();

    res.status(200).json({ success: true, message: 'Results recorded successfully', report });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit report for Pathologist Review (Technician)
// @route   PUT /api/reports/:id/submit-review
exports.submitForReview = async (req, res, next) => {
  try {
    const report = await LaboratoryReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = 'submitted_for_review';
    report.technicianName = req.user ? req.user.name : report.technicianName;

    report.auditHistory.push({
      action: 'SUBMITTED_FOR_REVIEW',
      modifiedBy: req.user ? req.user._id : null,
      modifierName: req.user ? req.user.name : 'Technician',
      modifierRole: req.user ? req.user.role : 'technician',
      changesSummary: 'Results submitted to Consultant Pathologist for verification',
    });

    await report.save();

    // Advance associated sample stage if present
    if (report.sampleId) {
      await Sample.findByIdAndUpdate(report.sampleId, {
        currentStage: 'Report Under Review',
        $push: {
          statusHistory: {
            stage: 'Report Under Review',
            timestamp: new Date(),
            updatedByName: req.user ? req.user.name : 'Lab Staff',
            location: 'Pathology Review Desk',
            remarks: 'Technologist completed testing; awaiting pathologist sign-off',
          }
        }
      });
    }

    res.status(200).json({ success: true, message: 'Report submitted for review', report });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve and Publish Report (Only Pathologist or Admin)
// @route   PUT /api/reports/:id/approve
exports.approveAndPublishReport = async (req, res, next) => {
  try {
    const { actionType, pathologistRemarks } = req.body; // 'approve' or 'publish'
    const report = await LaboratoryReport.findById(req.params.id);

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // Strict role check: Only pathologist or admin can approve/publish
    if (!['pathologist', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Security Alert: Only certified pathologists or authorized administrators can approve and publish laboratory reports.',
      });
    }

    const newStatus = actionType === 'approve' ? 'approved' : 'published';
    report.status = newStatus;
    report.verifiedBy = req.user._id;
    report.pathologistName = req.user.name;
    report.approvedAt = new Date();
    if (newStatus === 'published') {
      report.publishedAt = new Date();
    }
    if (pathologistRemarks) {
      report.clinicalImpression = pathologistRemarks;
    }

    report.auditHistory.push({
      action: newStatus === 'published' ? 'REPORT_PUBLISHED' : 'REPORT_APPROVED',
      modifiedBy: req.user._id,
      modifierName: req.user.name,
      modifierRole: req.user.role,
      changesSummary: `Report ${newStatus} with electronic verification sign-off`,
    });

    await report.save();

    // Advance Sample to Report Approved / Published
    if (report.sampleId) {
      const stageName = newStatus === 'published' ? 'Report Published' : 'Report Approved';
      await Sample.findByIdAndUpdate(report.sampleId, {
        currentStage: stageName,
        $push: {
          statusHistory: {
            stage: stageName,
            timestamp: new Date(),
            updatedByName: req.user.name,
            location: 'Central Pathology Laboratory',
            remarks: `Verified and ${newStatus} by ${req.user.name}`,
          }
        }
      });
    }

    // Trigger Notification and Email if published
    if (newStatus === 'published') {
      const booking = await Booking.findById(report.bookingId);
      if (booking && booking.customerId) {
        await Notification.create({
          recipientId: booking.customerId,
          title: 'Laboratory Report Published',
          message: `Your clinical report for ${report.testName} (ID: ${report.reportId}) is now available for download.`,
          type: 'report',
          link: `/customer/reports`,
        });

        await sendReportReadyEmail(report, report.patientInfo);
      }
    }

    await logAudit({
      action: `REPORT_${newStatus.toUpperCase()}`,
      entityType: 'LaboratoryReport',
      entityId: report._id,
      user: req.user,
      details: { reportId: report.reportId, testName: report.testName },
      req,
    });

    res.status(200).json({ success: true, message: `Report ${newStatus} successfully`, report });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Official Laboratory Report PDF
// @route   GET /api/reports/:id/pdf
exports.downloadReportPDF = async (req, res, next) => {
  try {
    const report = await LaboratoryReport.findOne({
      $or: [
        { reportId: req.params.id.toUpperCase() },
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      ],
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const booking = await Booking.findById(report.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found for this report' });
    }

    if (req.user.role === 'customer') {
      if (String(booking.customerId) !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied to this report.' });
      }
      if (!['published', 'approved'].includes(report.status)) {
        return res.status(403).json({ success: false, message: 'This report is not yet available to download.' });
      }
    }

    // Set PDF response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="MALAK_Lab_Report_${report.reportId}.pdf"`);

    generateReportPDF(report, res);
  } catch (error) {
    next(error);
  }
};
