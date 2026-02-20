const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Authenticate as Admin (Simulated)
        const adminEmail = 'cheran@bitsathy.ac.in'; // Assuming this is an admin
        // Ideally we'd login, but here we just test the DB effects of what the frontend would do

        // 2. Create a Faculty User (Mocking api/auth/users POST)
        const facultyData = {
            name: 'Test Faculty Admin Created',
            email: 'test_faculty_admin@bitsathy.ac.in',
            password: 'password123',
            role: 'faculty',
            department: 'IT'
        };

        await User.deleteOne({ email: facultyData.email });
        const faculty = await User.create(facultyData);
        console.log('2. Faculty Created via Script:', faculty.email);

        // 3. Verify Faculty Fetch (Mocking api/auth/users?role=faculty)
        const facultyList = await User.find({ role: 'faculty' });
        console.log('3. Faculty List Size:', facultyList.length);
        const found = facultyList.find(f => f.email === facultyData.email);
        if (found) console.log('   -> Verified newly created faculty is in list.');
        else console.error('   -> Failed to find new faculty in list.');

        // 4. Create Course with this Faculty (Mocking api/courses POST)
        const courseData = {
            code: 'IT999',
            name: 'Advanced Faculty Testing',
            department: 'IT',
            semester: '8',
            instructors: [facultyData.email]
        };

        await Course.deleteOne({ code: courseData.code });
        const course = await Course.create(courseData);
        console.log('4. Course Created with Instructor:', course.code);
        console.log('   -> Instructors:', course.instructors);

        if (course.instructors.includes(facultyData.email)) {
            console.log('   -> Verified faculty is assigned to course.');
        } else {
            console.error('   -> Failed to assign faculty to course.');
        }

        // Cleanup
        await User.deleteOne({ email: facultyData.email });
        await Course.deleteOne({ code: courseData.code });
        console.log('Cleanup Complete.');

        process.exit();
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

runTest();
