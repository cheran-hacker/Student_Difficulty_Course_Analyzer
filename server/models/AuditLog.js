const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true, // e.g., 'LOGIN', 'DELETE_COURSE', 'UPDATE_GRADE'
    },
    details: {
        type: String,
        default: '',
    },
    ipAddress: {
        type: String,
    },
    resourceId: {
        type: String, // ID of the object being affected (optional)
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
