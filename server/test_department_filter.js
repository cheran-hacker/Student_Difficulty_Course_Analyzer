const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
dotenv.config();

console.log('Script started');

const testFilter = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_analyzer');
        console.log('Connected to MongoDB');

        // 1. Create a test student
        const studentEmail = 'filter_test_' + Date.now() + '@bitsathy.ac.in';
        const student = await User.create({
            name: 'Filter Test Student',
            email: studentEmail,
            password: 'password123',
            role: 'student',
            studentId: 'FT_' + Date.now(),
            department: 'Test Dept A',
            year: 'I'
        });
        console.log(`Created student with department: ${student.department}`);

        // 2. Create test courses
        const courseA = await Course.create({
            code: 'TEST101_' + Date.now(),
            name: 'Course A',
            department: 'Test Dept A',
            semester: '1'
        });
        const courseB = await Course.create({
            code: 'TEST102_' + Date.now(),
            name: 'Course B',
            department: 'Test Dept B',
            semester: '1'
        });
        console.log('Created two courses in different departments');

        // 3. Simulate getCourses filter logic
        console.log('Simulating getCourses filter for student...');
        let filter = {};
        if (student && student.role === 'student' && student.department) {
            filter.department = student.department;
        }

        const filteredCourses = await Course.find(filter);
        console.log(`Student sees ${filteredCourses.length} course(s)`);

        const allMatch = filteredCourses.every(c => c.department === student.department);
        console.log(`All courses match department: ${allMatch}`);

        if (allMatch && filteredCourses.length === 1 && filteredCourses[0].name === 'Course A') {
            console.log('SUCCESS: Filtering logic works correctly!');
        } else {
            console.error('FAILURE: Filtering logic failed!');
        }

        // 4. Simulate Admin (no filter)
        console.log('Simulating getCourses for Admin...');
        const adminCourses = await Course.find({});
        console.log(`Admin sees ${adminCourses.length} course(s) total`);

        // Cleanup
        await User.deleteOne({ _id: student._id });
        await Course.deleteOne({ _id: courseA._id });
        await Course.deleteOne({ _id: courseB._id });
        console.log('Cleanup complete');

        process.exit(allMatch ? 0 : 1);
    } catch (error) {
        console.error('Error during test:', error);
        process.exit(1);
    }
};

testFilter();
