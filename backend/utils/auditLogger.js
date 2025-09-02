const AuditLog = require('../models/auditLogModel');
/**
 * Middleware wrapper to create audit logs
 */
async function createAuditLog(
  userId,              // { id }
  roleId,
  collectionId,
  collectionName,   
  action,            
  description, 
  functionName,   
  priority,   
  changes = {},      // { before, after }
  req = {}           // Optional: for IP/user-agent
) {
  try {
    await AuditLog.create({
      userId,
      roleId,
      collectionId,
      collectionName,
      action,
      description,
      changes,
      functionName,
      priority,
      api:req.originalUrl,
      ipAddress: req.ip || '',
      userAgent: req.headers?.['user-agent'] || ''
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

module.exports ={createAuditLog};
