const CourseRequest = require('../models/CourseRequest');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create a course request
// @route   POST /api/requests
// @access  Student
const createRequest = async (req, res) => {
    try {
        const { courseCode, courseName, department, semester, instructors } = req.body;

        const request = await CourseRequest.create({
            student: req.user._id,
            courseCode,
            courseName,
            department,
            semester: semester || '1',
            instructors
        });

        res.status(201).json(request);
    } catch (error) {
        console.error('[CreateRequest] Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Admin
const getRequests = async (req, res) => {
    try {
        const requests = await CourseRequest.find().populate('student', 'name email').sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update request details and status
// @route   PUT /api/requests/:id
// @access  Admin
const updateRequestStatus = async (req, res) => {
    try {
        const { studentId, courseCode, courseName, department, semester, instructors, status } = req.body;
        console.log(`[RequestController] Updating request ${req.params.id} (status: ${status}, studentId: ${studentId})`);

        const request = await CourseRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Update student if studentId is provided (Admin fix)
        if (studentId) {
            const student = await User.findById(studentId);
            if (student) {
                request.student = student._id;
            } else {
                // Try finding by studentId field just in case
                const studentBySid = await User.findOne({ studentId: studentId });
                if (studentBySid) {
                    request.student = studentBySid._id;
                }
            }
        }

        // Update fields if provided
        if (courseCode) request.courseCode = courseCode;
        if (courseName) request.courseName = courseName;
        if (department) request.department = department;
        if (semester) request.semester = semester;
        if (instructors) request.instructors = instructors;

        const newStatus = status;

        // Create course BEFORE updating status if approving
        if (newStatus === 'approved' && request.status !== 'approved') {
            try {
                console.log(`[Approval] Processing request for course: ${request.courseCode}`);

                // Check for existing course (case-insensitive)
                let course = await Course.findOne({
                    code: { $regex: new RegExp(`^${request.courseCode}$`, 'i') }
                });

                if (!course) {
                    console.log(`[Auto-Create] Creating new course: ${request.courseCode}`);

                    // Parse instructors more robustly
                    let instructorsArray = [];
                    if (request.instructors) {
                        instructorsArray = request.instructors
                            .split(',')
                            .map(i => i.trim())
                            .filter(i => i !== '');
                    }
                    if (instructorsArray.length === 0) {
                        instructorsArray = ['TBA'];
                    }

                    course = await Course.create({
                        code: request.courseCode,
                        name: request.courseName,
                        department: request.department,
                        semester: request.semester || '1',
                        description: `Automatically created from student request.`,
                        instructors: instructorsArray
                    });
                    console.log(`[Auto-Create] ✓ Course created successfully: ${course.code} (ID: ${course._id})`);
                } else {
                    console.log(`[Auto-Create] Course ${request.courseCode} already exists (ID: ${course._id})`);
                }

                // Enroll the requesting student in the course
                if (course && request.student) {
                    await User.findByIdAndUpdate(request.student, {
                        $addToSet: { courses: course._id }
                    });
                    console.log(`[Auto-Enroll] ✓ Student ${request.student} enrolled in ${course.code}`);
                }
            } catch (err) {
                console.error('[Auto-Create/Enroll] ERROR:', err);
                return res.status(500).json({
                    message: 'Failed to create course',
                    error: err.message
                });
            }
        }
        // Handle Rejection/Pending after Approval (Undo effects)
        else if ((newStatus === 'rejected' || newStatus === 'pending') && request.status === 'approved') {
            try {
                console.log(`[Rejection] Reverting approval for course: ${request.courseCode}`);

                // Find the course
                const course = await Course.findOne({
                    code: { $regex: new RegExp(`^${request.courseCode}$`, 'i') }
                });

                if (course) {
                    // 1. Unenroll the student
                    if (request.student) {
                        await User.findByIdAndUpdate(request.student, {
                            $pull: { courses: course._id }
                        });
                        console.log(`[Auto-Unenroll] Student ${request.student} unenrolled from ${course.code}`);
                    }

                    // 2. Check if other students are enrolled
                    const enrolledCount = await User.countDocuments({ courses: course._id });

                    // Note: enrolledCount might still include the student if the update above hasn't propagated to a secondary read, 
                    // but findByIdAndUpdate is atomic. However, let's double check. 
                    // Actually, since we waited for the update, enrolledCount should reflect zero if this was the only student.

                    if (enrolledCount === 0) {
                        console.log(`[Cleanup] Course ${course.code} has 0 students. Deleting...`);
                        await Course.findByIdAndDelete(course._id);
                        console.log(`[Cleanup] ✓ Course deleted.`);
                    } else {
                        console.log(`[Cleanup] Course ${course.code} has ${enrolledCount} other students enrolled. Keeping it.`);
                    }
                }
            } catch (err) {
                console.error('[Auto-Revert] ERROR:', err);
                // We don't block the status update if cleanup fails, but we log it
            }
        }

        // Now update the status if provided
        if (newStatus) request.status = newStatus;

        const updatedRequest = await request.save();

        // Populate student data for response
        const populatedRequest = await CourseRequest.findById(updatedRequest._id)
            .populate('student', 'name email studentId');

        res.json(populatedRequest);

    } catch (error) {
        console.error('[UpdateRequest] Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { createRequest, getRequests, updateRequestStatus };
