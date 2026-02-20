const express = require('express');
const router = express.Router();
const { protect, faculty } = require('../middleware/authMiddleware');
const {
    getFacultyDashboard,
    getFacultyCourses,
    getCourseFeedbacks,
    submitFacultyFeedback,
    getAtRiskStudents,
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    uploadResource,
    updateResource,
    deleteResource,
    getResources
} = require('../controllers/facultyController');

router.use(protect);
router.use(faculty);

router.get('/dashboard', getFacultyDashboard);
router.get('/courses', getFacultyCourses);
router.get('/at-risk', getAtRiskStudents);
router.get('/course/:courseId/feedbacks', getCourseFeedbacks);
router.post('/feedback', submitFacultyFeedback);

router.get('/my-requests', require('../controllers/facultyController').getMyCourseRequests);

// Communication & Resources routes
router.post('/announcement', createAnnouncement);
router.put('/announcement/:id', updateAnnouncement);
router.delete('/announcement/:id', deleteAnnouncement);
router.get('/course/:courseId/announcements', getAnnouncements);
router.post('/resource', uploadResource);
router.put('/resource/:id', updateResource);
router.delete('/resource/:id', deleteResource);
router.get('/course/:courseId/resources', getResources);

router.post('/request-access', require('../controllers/facultyController').requestCourseAccess);
router.put('/request/:id', require('../controllers/facultyController').updateMyCourseRequest);
router.delete('/request/:id', require('../controllers/facultyController').deleteMyCourseRequest);
router.get('/analytics/course/:courseId', require('../controllers/facultyController').getCourseRiskAnalytics);

router.post('/ai-chat', require('../controllers/facultyController').getAIChatResponse);

module.exports = router;
