const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getFacultyRequests,
    updateFacultyRequest
} = require('../controllers/adminFacultyRequestController');

router.use(protect);
router.use(admin);

router.get('/', getFacultyRequests);
router.put('/:id', updateFacultyRequest);

module.exports = router;
