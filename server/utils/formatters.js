/**
 * Formatting utility functions for currency, dates, and labels
 */

/**
 * Format a number as a USD currency string
 * @param {number} amount
 * @returns {string} e.g. "$1,234.56"
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Format a date as a readable string
 * @param {Date|string} date
 * @param {string} [format='short'] - 'short', 'long', 'time', 'datetime'
 * @returns {string}
 */
const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  switch (format) {
    case 'long':
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    case 'time':
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case 'datetime':
      return `${d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    default:
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

/**
 * Capitalize the first letter of each word in a string
 * @param {string} str
 * @returns {string}
 */
const toTitleCase = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Convert a booking/sample status enum value to a readable label
 * @param {string} status
 * @returns {string}
 */
const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Mask an email for privacy (display only in logs)
 * @param {string} email
 * @returns {string} e.g. "j***@example.com"
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***';
  const [user, domain] = email.split('@');
  const masked = user.charAt(0) + '***';
  return `${masked}@${domain}`;
};

/**
 * Mask a phone number for privacy
 * @param {string} phone
 * @returns {string} e.g. "+1 (***) ***-5678"
 */
const maskPhone = (phone) => {
  if (!phone) return '***';
  const str = String(phone);
  if (str.length < 4) return '***';
  return str.slice(0, -4).replace(/\d/g, '*') + str.slice(-4);
};

module.exports = {
  formatCurrency,
  formatDate,
  toTitleCase,
  formatStatus,
  maskEmail,
  maskPhone,
};
