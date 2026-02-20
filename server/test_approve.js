const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const CourseRequest = require('./models/CourseRequest');
const User = require('./models/User');

dotenv.config();

const testApproval = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Create a Mock User (Student)
        let student = await User.findOne({ email: 'teststudent@example.com' });
        if (!student) {
            student = await User.create({
                name: 'Test Student',
                email: 'teststudent@example.com',
                password: 'password123',
                role: 'student'
            });
        }

        // 2. Create a Course Request
        const testCode = 'TEST999';
        await CourseRequest.deleteMany({ courseCode: testCode });
        await Course.deleteMany({ code: testCode });

        const request = await CourseRequest.create({
            student: student._id,
            courseCode: testCode,
            courseName: 'Test Course 999',
            department: 'Computer Science',
            status: 'pending'
        });
        console.log(`Request created: ${request._id}`);

        // 3. Simulate Approval Logic (Directly calling logic from controller)
        // We replicate the controller logic here to test the specific block
        request.status = 'approved';
        await request.save();
        console.log('Request status updated to approved');

        const existingCourse = await Course.findOne({
            code: { $regex: new RegExp(`^${request.courseCode}$`, 'i') }
        });

        if (!existingCourse) {
            console.log(`[Test] Creating course: ${request.courseCode}`);
            try {
                const newCourse = await Course.create({
                    code: request.courseCode,
                    name: request.courseName,
                    department: request.department,
                    semester: 'Spring 2024',
                    description: `Automatically created from student request.`,
                    instructors: ['TBA']
                });
                console.log(`[Test] Success! Course created: ${newCourse.code}`);
            } catch (err) {
                console.error(`[Test] FAILED to create course:`, err);
            }
        } else {
            console.log(`[Test] Course already exists.`);
        }

        // 4. Verify Final State
        const finalCourse = await Course.findOne({ code: testCode });
        if (finalCourse) {
            console.log('VERIFICATION PASSED: Course exists in DB.');
        } else {
            console.log('VERIFICATION FAILED: Course NOT found in DB.');
        }

        process.exit();

    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

testApproval();
