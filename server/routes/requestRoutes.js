const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createRequest).get(protect, admin, getRequests);
router.route('/:id').put(protect, admin, updateRequestStatus);

module.exports = router;
