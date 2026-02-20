const mongoose = require('mongoose');

const systemSettingsSchema = mongoose.Schema({
    isMaintenanceMode: {
        type: Boolean,
        default: false,
    },
    announcement: {
        type: String,
        default: '',
    }
}, {
    timestamps: true,
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
module.exports = SystemSettings;
