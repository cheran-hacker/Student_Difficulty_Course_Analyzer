const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const CourseRequest = require('./models/CourseRequest');
require('dotenv').config();

const verifyRejection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Setup Data
        const code = `REJECT_TEST_${Date.now()}`;
        const student = await User.create({ name: 'Reject Test', email: `rej${Date.now()}@test.com`, password: 'pwd', role: 'student', studentId: `R${Date.now()}` });

        // 2. Create and Approve Request
        let request = await CourseRequest.create({
            student: student._id,
            courseCode: code,
            courseName: 'Rejection Physics',
            department: 'Science',
            semester: '1',
            status: 'approved' // Start as directly approved or transition? Let's simulate transition if needed, but for now assuming it was approved.
        });

        // Manually create course and enroll to simulate state before rejection
        let course = await Course.create({ code, name: 'Rejection Physics', department: 'Science', semester: '1', instructors: ['Dr. No'] });
        await User.findByIdAndUpdate(student._id, { $push: { courses: course._id } });

        console.log('Setup Complete: Request Approved, Course Created, Student Enrolled.');

        // 3. Simulate Rejection Controller Logic
        console.log('Simulating Rejection...');

        // Logic copy-paste from controller simulation
        if (request.status === 'approved') {
            const existingCourse = await Course.findOne({ code });
            if (existingCourse) {
                await User.findByIdAndUpdate(student._id, { $pull: { courses: existingCourse._id } });
                const count = await User.countDocuments({ courses: existingCourse._id });
                if (count === 0) {
                    await Course.findByIdAndDelete(existingCourse._id);
                    console.log('Course Deleted');
                }
            }
            request.status = 'rejected';
            await request.save();
        }

        // 4. Verify
        const checkCourse = await Course.findOne({ code });
        const checkStudent = await User.findById(student._id);

        console.log('--- Verification ---');
        console.log('Course Exists?', checkCourse ? 'YES (FAIL)' : 'NO (PASS)');
        console.log('Student Enrolled?', checkStudent.courses.includes(course._id) ? 'YES (FAIL)' : 'NO (PASS)');

        // Cleanup
        await User.deleteOne({ _id: student._id });
        if (checkCourse) await Course.deleteOne({ _id: checkCourse._id });
        await CourseRequest.deleteOne({ _id: request._id });

        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verifyRejection();
