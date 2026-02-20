const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get all feedback (Admin Only)
// @route   GET /api/admin/feedback/all
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized - Admin only' });
        }

        const feedback = await Feedback.find()
            .populate('user', 'name studentId email')
            .populate('course', 'name code department')
            .sort({ createdAt: -1 });

        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create feedback (Admin Only)
// @route   POST /api/admin/feedback
// @access  Private/Admin
const createFeedback = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized - Admin only' });
        }

        const { userId, courseId, difficultyIndex, timeCommitment, sentimentScore, comments, ratings } = req.body;

        const feedback = new Feedback({
            user: userId,
            course: courseId,
            difficultyIndex,
            timeCommitment,
            sentimentScore,
            comments,
            ratings
        });

        const savedFeedback = await feedback.save();
        const populated = await Feedback.findById(savedFeedback._id)
            .populate('user', 'name studentId')
            .populate('course', 'name code');

        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update feedback (Admin Only)
// @route   PUT /api/admin/feedback/:id
// @access  Private/Admin
const updateFeedback = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized - Admin only' });
        }

        const { userId, courseId, difficultyIndex, timeCommitment, sentimentScore, comments, ratings } = req.body;

        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        feedback.user = userId || feedback.user;
        feedback.course = courseId || feedback.course;
        feedback.difficultyIndex = difficultyIndex !== undefined ? difficultyIndex : feedback.difficultyIndex;
        feedback.timeCommitment = timeCommitment !== undefined ? timeCommitment : feedback.timeCommitment;
        feedback.sentimentScore = sentimentScore !== undefined ? sentimentScore : feedback.sentimentScore;
        feedback.comments = comments !== undefined ? comments : feedback.comments;
        feedback.ratings = ratings || feedback.ratings;

        const updated = await feedback.save();
        const populated = await Feedback.findById(updated._id)
            .populate('user', 'name studentId')
            .populate('course', 'name code');

        res.json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAllFeedback, createFeedback, updateFeedback };
