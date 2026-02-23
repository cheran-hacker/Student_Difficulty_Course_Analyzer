const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { toggleUserLoginStatus } = require('../controllers/authController');

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
router.get('/students', protect, admin, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Toggle user login status
// @route   PATCH /api/admin/users/:id/toggle-login
// @access  Private/Admin
router.patch('/users/:id/toggle-login', protect, admin, toggleUserLoginStatus);

module.exports = router;
