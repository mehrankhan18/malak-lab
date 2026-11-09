const AuditLog = require('../models/AuditLog');

const logAudit = async ({ action, entityType, entityId, user, details, req }) => {
  try {
    await AuditLog.create({
      action,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      performedBy: user ? user._id : null,
      performedByName: user ? user.name : 'System',
      performedByRole: user ? user.role : 'System',
      details,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1',
    });
  } catch (err) {
    console.error('[AuditLog Error]:', err.message);
  }
};

module.exports = { logAudit };

