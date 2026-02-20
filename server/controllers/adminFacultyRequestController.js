const FacultyCourseRequest = require('../models/FacultyCourseRequest');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all faculty course requests
// @route   GET /api/admin/faculty-requests
// @access  Private/Admin
const getFacultyRequests = async (req, res) => {
    try {
        const requests = await FacultyCourseRequest.find()
            .populate('faculty', 'name email department')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('[AdminFacultyRequest] getFacultyRequests Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update faculty course request status (Approve/Reject)
// @route   PUT /api/admin/faculty-requests/:id
// @access  Private/Admin
const updateFacultyRequest = async (req, res) => {
    try {
        const { status, adminComments } = req.body;
        const request = await FacultyCourseRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const oldStatus = request.status;
        request.status = status || request.status;
        request.adminComments = adminComments || request.adminComments;

        // Automation: If approved, create course and assign faculty
        if (status === 'approved' && oldStatus !== 'approved') {
            console.log(`[AdminFacultyAPI] Approving request for: ${request.courseCode}`);

            // 1. Find or Create Course
            let course = await Course.findOne({ code: request.courseCode });
            const facultyUser = await User.findById(request.faculty);

            if (!course) {
                course = await Course.create({
                    code: request.courseCode,
                    name: request.courseName,
                    department: request.department,
                    semester: '1', // Default
                    description: `Faculty requested course. Proctored by ${facultyUser?.name || 'Faculty'}.`,
                    instructors: [facultyUser?.email || 'TBA']
                });
                console.log(`[AdminFacultyAPI] ✓ Course created: ${course.code}`);
            } else {
                // If course exists, ensure faculty is in the instructors list
                if (facultyUser && !course.instructors.includes(facultyUser.email)) {
                    course.instructors.push(facultyUser.email);
                    await course.save();
                }
                console.log(`[AdminFacultyAPI] Course ${course.code} already exists. Updated instructors.`);
            }

            // 2. Assign course to faculty user model (if there is a field for it, though usually it's instructor email based)
            // Some implementations use a 'courses' array on User, others search by instructor email.
            // Let's check User model if it has a courses field.
            if (facultyUser && facultyUser.courses) {
                await User.findByIdAndUpdate(request.faculty, {
                    $addToSet: { courses: course._id }
                });
            }
        }

        await request.save();
        const populatedRequest = await FacultyCourseRequest.findById(request._id)
            .populate('faculty', 'name email department');

        res.json(populatedRequest);
    } catch (error) {
        console.error('[AdminFacultyRequest] updateFacultyRequest Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getFacultyRequests,
    updateFacultyRequest
};
