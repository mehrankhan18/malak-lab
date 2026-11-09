/**
 * Input validators for Booking routes
 */

const ALLOWED_GENDERS = ['Male', 'Female', 'Other'];
const ALLOWED_COLLECTION_TYPES = ['home_collection', 'branch_visit'];
const ALLOWED_PAYMENT_METHODS = ['online', 'cash_on_collection', 'card_at_branch', 'demo_paid'];

/**
 * Middleware: validate POST /api/bookings
 */
const validateCreateBooking = (req, res, next) => {
  const { patientDetails, collectionType, appointmentDate, timeSlot, items, paymentMethod } = req.body;
  const errors = [];

  // Patient details
  if (!patientDetails || typeof patientDetails !== 'object') {
    errors.push('Patient details are required.');
  } else {
    if (!patientDetails.fullName || patientDetails.fullName.trim().length < 2) {
      errors.push('Patient full name is required (minimum 2 characters).');
    }
    if (!patientDetails.phone || !/^\+?[\d\s\-().]{7,20}$/.test(patientDetails.phone)) {
      errors.push('A valid phone number is required.');
    }
    const age = Number(patientDetails.age);
    if (!patientDetails.age || isNaN(age) || age < 1 || age > 120) {
      errors.push('Patient age must be a number between 1 and 120.');
    }
    if (patientDetails.gender && !ALLOWED_GENDERS.includes(patientDetails.gender)) {
      errors.push(`Gender must be one of: ${ALLOWED_GENDERS.join(', ')}.`);
    }
  }

  // Collection type
  if (!collectionType || !ALLOWED_COLLECTION_TYPES.includes(collectionType)) {
    errors.push(`Collection type must be one of: ${ALLOWED_COLLECTION_TYPES.join(', ')}.`);
  }

  // Appointment date
  if (!appointmentDate) {
    errors.push('Appointment date is required.');
  } else {
    const apptDate = new Date(appointmentDate);
    if (isNaN(apptDate.getTime())) {
      errors.push('Invalid appointment date format.');
    }
  }

  // Time slot
  if (!timeSlot || typeof timeSlot !== 'string' || timeSlot.trim().length < 3) {
    errors.push('Appointment time slot is required.');
  }

  // Items
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('At least one test or health package must be selected.');
  } else {
    items.forEach((item, idx) => {
      if (!item.itemName) errors.push(`Item at index ${idx} is missing a name.`);
      if (!item.price || isNaN(Number(item.price)) || Number(item.price) < 0) {
        errors.push(`Item "${item.itemName || idx}" has an invalid price.`);
      }
      if (!['test', 'package'].includes(item.itemType)) {
        errors.push(`Item "${item.itemName || idx}" has an invalid type (must be 'test' or 'package').`);
      }
    });
  }

  // Payment method
  if (paymentMethod && !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push(`Payment method must be one of: ${ALLOWED_PAYMENT_METHODS.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Booking validation failed', errors });
  }

  // Sanitize string fields
  if (patientDetails) {
    patientDetails.fullName = String(patientDetails.fullName).trim();
    patientDetails.phone = String(patientDetails.phone).trim();
    if (patientDetails.email) {
      patientDetails.email = String(patientDetails.email).toLowerCase().trim();
    }
  }

  next();
};

/**
 * Middleware: validate PUT /api/bookings/:id/reschedule
 */
const validateReschedule = (req, res, next) => {
  const { appointmentDate, timeSlot } = req.body;
  const errors = [];

  if (!appointmentDate) {
    errors.push('New appointment date is required.');
  } else {
    const apptDate = new Date(appointmentDate);
    if (isNaN(apptDate.getTime())) {
      errors.push('Invalid appointment date format.');
    }
  }

  if (!timeSlot || typeof timeSlot !== 'string' || timeSlot.trim().length < 3) {
    errors.push('New time slot is required.');
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Reschedule validation failed', errors });
  }

  next();
};

module.exports = {
  validateCreateBooking,
  validateReschedule,
};
