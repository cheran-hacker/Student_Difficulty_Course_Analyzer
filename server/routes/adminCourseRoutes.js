const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    createCourse
} = require('../controllers/courseController');
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized - Admin only' });
    }
};

// Get all courses with enhanced filtering
router.get('/all', protect, adminOnly, getCourses);

// Get course statistics
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const coursesByDept = await Course.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);
        const coursesWithFeedback = await Feedback.distinct('course');

        res.json({
            totalCourses,
            coursesByDept,
            coursesWithFeedback: coursesWithFeedback.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create course
router.post('/', protect, adminOnly, createCourse);

// Update course
router.put('/:id', protect, adminOnly, updateCourse);

// Delete course
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check for dependencies
        const feedbackCount = await Feedback.countDocuments({ course: req.params.id });
        const enrolledStudents = await User.countDocuments({ courses: req.params.id });

        if (feedbackCount > 0 || enrolledStudents > 0) {
            return res.status(400).json({
                message: `Cannot delete course. ${feedbackCount} feedback(s) and ${enrolledStudents} student(s) enrolled.`,
                dependencies: { feedbackCount, enrolledStudents }
            });
        }

        await course.deleteOne();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get single course
router.get('/:id', protect, adminOnly, getCourseById);

module.exports = router;
