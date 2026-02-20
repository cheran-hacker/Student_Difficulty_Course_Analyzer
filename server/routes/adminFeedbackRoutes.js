const express = require('express');
const router = express.Router();
const { getAllFeedback, createFeedback, updateFeedback } = require('../controllers/adminFeedbackController');
const { protect } = require('../middleware/authMiddleware');

router.get('/all', protect, getAllFeedback);
router.post('/', protect, createFeedback);
router.put('/:id', protect, updateFeedback);

module.exports = router;
