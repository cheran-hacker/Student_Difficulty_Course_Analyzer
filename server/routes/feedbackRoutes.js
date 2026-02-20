const express = require('express');
const router = express.Router();
const { submitFeedback, getCourseAnalytics, getFeedbackByUser, deleteFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitFeedback);
router.get('/analytics/:courseId', protect, getCourseAnalytics);
router.get('/user/:userId', protect, getFeedbackByUser);
router.delete('/:feedbackId', protect, deleteFeedback);

module.exports = router;
