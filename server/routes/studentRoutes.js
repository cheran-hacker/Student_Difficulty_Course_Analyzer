const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    enrollCourse,
    dropCourse,
    getStudentDashboard
} = require('../controllers/studentController');

router.use(protect);

router.post('/enroll', enrollCourse);
router.post('/drop', dropCourse);
router.get('/dashboard', getStudentDashboard);

module.exports = router;
