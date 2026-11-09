const Sample = require('../models/Sample');
const Booking = require('../models/Booking');
const LaboratoryReport = require('../models/LaboratoryReport');
const { logAudit } = require('../middleware/auditMiddleware');

const STAGES = [
  'Booking Confirmed',
  'Sample Collection Scheduled',
  'Sample Collected',
  'Sample Received',
  'Testing in Progress',
  'Report Under Review',
  'Report Approved',
  'Report Published',
];

// @desc    Get sample tracking information by sampleId, barcode, or bookingId (Public / Customer)
// @route   GET /api/samples/track/:query
exports.trackSample = async (req, res, next) => {
  try {
    const { query } = req.params;
    const cleanQuery = query.trim().toUpperCase();

    const sample = await Sample.findOne({
      $or: [
        { sampleId: cleanQuery },
        { barcode: cleanQuery },
        { bookingCode: cleanQuery },
      ],
    });

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'No sample tracking found for the provided identifier. Please check your Booking ID or Sample ID.',
      });
    }

    const report = sample.currentStage === 'Report Published'
      ? await LaboratoryReport.findOne({
        sampleId: sample._id,
        status: 'published',
      }).select('reportId')
      : null;
    const currentStageIndex = STAGES.indexOf(sample.currentStage);

    res.status(200).json({
      success: true,
      sample: {
        ...sample.toObject(),
        reportId: report?.reportId || null,
      },
      allStages: STAGES,
      currentStageIndex,
      isCompleted: sample.currentStage === 'Report Published',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all samples (Staff / Admin)
// @route   GET /api/samples
exports.getSamples = async (req, res, next) => {
  try {
    const { stage, collectorId, search } = req.query;
    const query = {};

    if (stage) query.currentStage = stage;
    if (collectorId) query.collectedBy = collectorId;
    if (search) {
      query.$or = [
        { sampleId: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { bookingCode: { $regex: search, $options: 'i' } },
      ];
    }

    const samples = await Sample.find(query)
      .sort({ updatedAt: -1 })
      .populate('bookingId')
      .populate('collectedBy');

    res.status(200).json({
      success: true,
      count: samples.length,
      samples,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sample status / stage (Staff / Technicians)
// @route   PUT /api/samples/:id/stage
exports.updateSampleStage = async (req, res, next) => {
  try {
    const { stage, location, remarks, tubeColor } = req.body;
    const sample = await Sample.findById(req.params.id);

    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    if (!STAGES.includes(stage)) {
      return res.status(400).json({ success: false, message: `Invalid stage. Must be one of: ${STAGES.join(', ')}` });
    }

    sample.currentStage = stage;
    if (tubeColor) sample.tubeColor = tubeColor;

    if (stage === 'Sample Collected') {
      sample.collectedAt = new Date();
      sample.collectedBy = req.user ? req.user._id : sample.collectedBy;
      sample.collectorName = req.user ? req.user.name : sample.collectorName;
    }

    if (stage === 'Sample Received') {
      sample.receivedAtLab = new Date();
    }

    sample.statusHistory.push({
      stage,
      timestamp: new Date(),
      updatedBy: req.user ? req.user._id : null,
      updatedByName: req.user ? req.user.name : 'Lab Staff',
      location: location || 'Central Processing Laboratory',
      remarks: remarks || `Transitioned to ${stage}`,
    });

    await sample.save();

    await logAudit({
      action: 'SAMPLE_STAGE_UPDATE',
      entityType: 'Sample',
      entityId: sample._id,
      user: req.user,
      details: { sampleId: sample.sampleId, newStage: stage, location },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Sample stage updated to '${stage}'`,
      sample,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a newly collected sample
// @route   POST /api/samples/register
exports.registerSample = async (req, res, next) => {
  try {
    const { bookingId, sampleType, tubeColor, remarks } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const sampleId = `SMP-${Math.floor(100000 + Math.random() * 900000)}`;
    const barcode = `BC${Math.floor(100000000 + Math.random() * 900000000)}`;

    const sample = await Sample.create({
      sampleId,
      barcode,
      bookingId: booking._id,
      bookingCode: booking.bookingId,
      testIds: booking.items.map(it => it.itemId),
      sampleType: sampleType || 'Blood (Serum)',
      tubeColor: tubeColor || 'Lavender (EDTA)',
      currentStage: 'Sample Collected',
      collectedAt: new Date(),
      collectedBy: req.user ? req.user._id : null,
      collectorName: req.user ? req.user.name : 'Staff Phlebotomist',
      statusHistory: [
        {
          stage: 'Booking Confirmed',
          timestamp: booking.createdAt,
          updatedByName: 'System',
          location: 'Appointment Desk',
        },
        {
          stage: 'Sample Collected',
          timestamp: new Date(),
          updatedBy: req.user ? req.user._id : null,
          updatedByName: req.user ? req.user.name : 'Phlebotomist',
          location: 'Patient Collection Site',
          remarks: remarks || 'Specimen drawn following sterile standard protocols',
        }
      ],
    });

    res.status(201).json({ success: true, message: 'Sample registered successfully', sample });
  } catch (error) {
    next(error);
  }
};
