const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware');
const CourseRequest = require('../models/CourseRequest');
const User = require('../models/User');
const Course = require('../models/Course');

// Get all course requests (admin)
router.get('/all', protect, admin, async (req, res) => {
    try {
        console.log(`[AdminAPI] ${new Date().toISOString()} GET /all - User: ${req.user?.name}`);
        const requests = await CourseRequest.find({})
            .populate('student', 'name email studentId')
            .sort({ createdAt: -1 });
        console.log(`[AdminAPI] Found ${requests.length} requests.`);
        res.json(requests);
    } catch (error) {
        console.error('[AdminAPI] GET /all Error:', error);
        res.status(500).json({ message: 'Server Error: Failed to fetch requests', error: error.message });
    }
});

// Create course request (admin can create on behalf of students)
router.post('/create', protect, admin, async (req, res) => {
    try {
        const { studentId, courseCode, courseName, department, semester } = req.body;
        console.log('[AdminAPI] Creating request for student:', studentId);

        // Verify student exists (check both _id and studentId field)
        let student;
        if (mongoose.Types.ObjectId.isValid(studentId)) {
            student = await User.findById(studentId);
        }

        if (!student) {
            student = await User.findOne({ studentId: studentId });
        }

        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found or is not a student' });
        }

        const actualStudentId = student._id;

        // Check for duplicate request
        const existingRequest = await CourseRequest.findOne({
            student: actualStudentId,
            courseCode,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Pending request already exists for this course' });
        }

        const request = new CourseRequest({
            student: actualStudentId,
            courseCode,
            courseName,
            department,
            semester,
            instructors: req.body.instructors // Added instructors field
        });

        const createdRequest = await request.save();
        const populatedRequest = await CourseRequest.findById(createdRequest._id)
            .populate('student', 'name email studentId');

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('[AdminAPI] POST /create Error:', error);
        res.status(500).json({ message: 'Server Error: Failed to create request', error: error.message });
    }
});

// Update course request
const { updateRequestStatus } = require('../controllers/requestController');
router.put('/:id', protect, admin, updateRequestStatus);

// Delete course request
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        console.log('[AdminAPI] Deleting request:', req.params.id);
        const request = await CourseRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        await request.deleteOne();
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('[AdminAPI] DELETE /:id Error:', error);
        res.status(500).json({ message: 'Server Error: Failed to delete request', error: error.message });
    }
});

// Get statistics
router.get('/stats', protect, admin, async (req, res) => {
    try {
        console.log(`[AdminAPI] ${new Date().toISOString()} GET /api/admin/requests/stats triggered`);
        const [total, pending, approved, rejected] = await Promise.all([
            CourseRequest.countDocuments(),
            CourseRequest.countDocuments({ status: 'pending' }),
            CourseRequest.countDocuments({ status: 'approved' }),
            CourseRequest.countDocuments({ status: 'rejected' })
        ]);

        console.log(`[AdminAPI] Stats computed: Total=${total}, Pending=${pending}`);
        res.json({ total, pending, approved, rejected });
    } catch (error) {
        console.error('[AdminAPI] GET /stats Error:', error);
        res.status(500).json({ message: 'Server Error: Failed to fetch stats', error: error.message });
    }
});

module.exports = router;

