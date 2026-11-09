/**
 * Pagination helper utilities for query building
 */

/**
 * Extract and normalize pagination params from request query
 * @param {Object} query - Express req.query
 * @param {number} [defaultLimit=20]
 * @param {number} [maxLimit=100]
 * @returns {{ page: number, limit: number, skip: number }}
 */
const getPagination = (query, defaultLimit = 20, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build a paginated API response envelope
 * @param {Array} data - The data array for this page
 * @param {number} total - Total matching documents
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} pagination meta + data
 */
const buildPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    count: data.length,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    data,
  };
};

module.exports = {
  getPagination,
  buildPaginatedResponse,
};
