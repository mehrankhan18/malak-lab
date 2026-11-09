/**
 * Unique ID generators for the LMS system
 * All IDs follow a consistent format: PREFIX-YEAR-RANDOM_DIGITS
 */

/**
 * Generate a booking reference code
 * @returns {string} e.g. "LMS-2026-83921"
 */
const generateBookingId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `LMS-${year}-${rand}`;
};

/**
 * Generate a laboratory report reference code
 * @returns {string} e.g. "REP-2026-74918"
 */
const generateReportId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `REP-${year}-${rand}`;
};

/**
 * Generate a sample tracking ID
 * @returns {string} e.g. "SMP-840291"
 */
const generateSampleId = () => {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SMP-${rand}`;
};

/**
 * Generate a barcode string for sample tubes
 * @returns {string} e.g. "BC990218412"
 */
const generateBarcode = () => {
  const rand = Math.floor(100000000 + Math.random() * 900000000);
  return `BC${rand}`;
};

/**
 * Generate an invoice number
 * @returns {string} e.g. "INV-2026-48821"
 */
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${rand}`;
};

/**
 * Generate a support ticket ID
 * @returns {string} e.g. "TCK-83921"
 */
const generateTicketId = () => {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `TCK-${rand}`;
};

/**
 * Generate a staff employee ID
 * @returns {string} e.g. "EMP-2948"
 */
const generateEmployeeId = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EMP-${rand}`;
};

/**
 * Generate a URL-safe slug from a name string
 * @param {string} name
 * @returns {string} e.g. "complete-blood-count-cbc"
 */
const generateSlug = (name) => {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

module.exports = {
  generateBookingId,
  generateReportId,
  generateSampleId,
  generateBarcode,
  generateInvoiceNumber,
  generateTicketId,
  generateEmployeeId,
  generateSlug,
};
