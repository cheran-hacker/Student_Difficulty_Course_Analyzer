const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, details, ipAddress, resourceId) => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            details,
            ipAddress,
            resourceId
        });
        console.log(`[AUDIT] User ${userId} performed ${action}`);
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
};

module.exports = { logAudit };
