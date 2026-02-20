const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,

    uploadSyllabus,
    deleteSyllabus,
    bulkDeleteCourses,
    bulkUpdateStatus,
    getCourseStats,
    getCourseWorkloadForecast,
    getCourseDifficultyPrediction,
    getDepartments,
    importCourses,
    getCourseStudents
} = require('../controllers/courseController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../config/uploadConfig');

// Public/protected routes
router.route('/').get(getCourses).post(protect, admin, createCourse);
router.post('/import', protect, admin, upload.single('file'), importCourses);
router.get('/stats', protect, getCourseStats);

// Analytics Routes
router.get('/:id/workload-forecast', protect, getCourseWorkloadForecast);
router.get('/:id/difficulty-prediction', protect, getCourseDifficultyPrediction);

// Department endpoint - MUST be before /:id route
router.get('/departments', getDepartments);
router.get('/:id/students', protect, getCourseStudents);

router
    .route('/:id')
    .get(getCourseById)
    .put(protect, faculty, updateCourse)
    .delete(protect, admin, deleteCourse);

router.post('/:id/syllabus', protect, faculty, upload.single('syllabus'), handleMulterError, uploadSyllabus);
router.delete('/:id/syllabus', protect, faculty, deleteSyllabus);

// Bulk operations
router.post('/bulk/delete', protect, admin, bulkDeleteCourses);
router.patch('/bulk/status', protect, admin, bulkUpdateStatus);

// Communication (Shared)
router.get('/:id/announcements', protect, require('../controllers/facultyController').getAnnouncements);
router.get('/:id/resources', protect, require('../controllers/facultyController').getResources);

module.exports = router;
