const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const User = require('../models/User'); // Added User import
const { analyzeSentiment } = require('../services/aiService');
const { addXP } = require('../services/gamificationService');

// @desc    Submit feedback for a course
// @route   POST /api/feedback
// @access  Private/Student
const submitFeedback = async (req, res) => {
    const { courseId, ratings, timeCommitment, comments } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        // Check if student already submitted feedback for this course
        const existingFeedback = await Feedback.findOne({
            course: courseId,
            user: req.user._id,
        });

        if (existingFeedback) {
            return res.status(400).json({ message: 'You have already submitted feedback for this course' });
        }

        // Calculate Sentiment Score
        let sentimentScore = 0;
        if (comments) {
            sentimentScore = await analyzeSentiment(comments);
        }

        const feedback = new Feedback({
            course: courseId,
            user: req.user._id,
            ratings,
            timeCommitment,
            comments,
            sentimentScore,
        });

        const savedFeedback = await feedback.save();

        // Gamification: Award XP for feedback
        // 50 XP for detailed reviews (>50 words ~ 250 chars), 10 XP for quick ratings
        const isDetailed = comments && comments.split(/\s+/).length > 50;
        const xpAmount = isDetailed ? 50 : 10;

        // Execute XP addition
        const xpResult = await addXP(req.user._id, xpAmount, 'FEEDBACK');

        if (xpResult.success) {
            const { checkBadges } = require('../services/gamificationService');
            // Trigger badge checks
            await checkBadges(req.user._id, 'REVIEW', {
                detailedReviewCount: isDetailed ? (req.user.detailedReviewCount || 0) + 1 : (req.user.detailedReviewCount || 0),
            });
        }

        // Fetch updated user to return to frontend
        const updatedUser = await User.findById(req.user._id).select('-password');

        res.status(201).json({
            feedback: savedFeedback,
            user: updatedUser,
            xpAwarded: xpAmount
        });
    } catch (error) {
        console.error('Submit Feedback Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const { aggregateCourseData } = require('../services/analyticsService');

// @desc    Get analytics for a specific course
// @route   GET /api/feedback/analytics/:courseId
// @access  Private
const getCourseAnalytics = async (req, res) => {
    try {
        const analytics = await aggregateCourseData(req.params.courseId);

        if (!analytics) {
            return res.status(404).json({ message: 'No feedback found for this course' });
        }

        res.json(analytics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get feedback by user ID
// @route   GET /api/feedback/user/:userId
// @access  Private
const getFeedbackByUser = async (req, res) => {
    try {
        // IDOR Check: Ensure requester is Admin OR the user themselves
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId.toString()) {
            return res.status(401).json({ message: 'Not authorized to view these records' });
        }

        const feedback = await Feedback.find({ user: req.params.userId }).populate('course', 'name code');
        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete feedback (Admin Only)
// @route   DELETE /api/feedback/:feedbackId
// @access  Private/Admin
const deleteFeedback = async (req, res) => {
    try {
        // Admin check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized - Admin only' });
        }

        const feedback = await Feedback.findById(req.params.feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        await Feedback.findByIdAndDelete(req.params.feedbackId);

        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { submitFeedback, getCourseAnalytics, getFeedbackByUser, deleteFeedback };
