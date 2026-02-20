const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUsers, adminCreateUser, getUserById, updateUser, deleteUser, resetPassword, getLeaderboard } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');


router.use((req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    try {
        const log = `[${new Date().toISOString()}] [AuthRouter] ${req.method} ${req.originalUrl}\n`;
        fs.appendFileSync(path.join(__dirname, '../server_access.log'), log);
    } catch (e) { }
    console.log(`[AuthRouter] ${req.method} ${req.originalUrl}`);
    // Force Restart Triggered
    next();
});

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/faculty', protect, require('../controllers/authController').getAllFaculty);
router.route('/users')
    .get(protect, admin, getUsers)
    .post(protect, admin, adminCreateUser);

router.put('/users/:id/reset-password', protect, admin, resetPassword);
router.get('/users/:id', protect, admin, getUserById);
router.put('/users/:id', protect, admin, updateUser);
router.get('/users/:id/courses', protect, admin, require('../controllers/authController').getUserAssignedCourses);
router.delete('/users/:id', protect, admin, deleteUser);
router.post('/users/bulk', protect, admin, require('../controllers/authController').bulkCreateUsers);

module.exports = router;
