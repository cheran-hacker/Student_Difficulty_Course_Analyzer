const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Enroll in a course
// @route   POST /api/student/enroll
// @access  Private/Student
const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const student = await User.findById(req.user._id);
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (student.courses.includes(courseId)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Add to Student
        student.courses.push(courseId);
        await student.save();

        // Update Course Analytics
        course.analytics.studentCount = (course.analytics.studentCount || 0) + 1;
        await course.save();

        res.status(200).json({
            message: 'Enrolled successfully',
            courseId: course._id,
            updatedCourses: student.courses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Drop a course
// @route   POST /api/student/drop
// @access  Private/Student
const dropCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const student = await User.findById(req.user._id);
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!student.courses.includes(courseId)) {
            return res.status(400).json({ message: 'Not enrolled in this course' });
        }

        // Remove from Student
        student.courses = student.courses.filter(id => id.toString() !== courseId);
        await student.save();

        // Update Course Analytics
        if (course.analytics.studentCount > 0) {
            course.analytics.studentCount -= 1;
            await course.save();
        }

        res.status(200).json({
            message: 'Dropped successfully',
            courseId: course._id,
            updatedCourses: student.courses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Student Dashboard Stats
// @route   GET /api/student/dashboard
// @access  Private/Student
const getStudentDashboard = async (req, res) => {
    try {
        const student = await User.findById(req.user._id)
            .select('-password')
            .populate('courses');

        res.json({
            student,
            enrolledCourses: student.courses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    enrollCourse,
    dropCourse,
    getStudentDashboard
};
