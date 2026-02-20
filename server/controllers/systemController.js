const SystemSettings = require('../models/SystemSettings');

// @desc    Get system settings (public)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({ isMaintenanceMode: false });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle maintenance mode
// @route   PUT /api/settings/maintenance
// @access  Admin
const toggleMaintenance = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({ isMaintenanceMode: true });
        } else {
            settings.isMaintenanceMode = !settings.isMaintenanceMode;
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getSettings, toggleMaintenance };
