const express = require('express');
const router = express.Router();
const { getSettings, toggleMaintenance } = require('../controllers/systemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/maintenance', protect, admin, toggleMaintenance);

module.exports = router;
