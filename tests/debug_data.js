const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./server/models/User');
const Course = require('./server/models/Course');
const Feedback = require('./server/models/Feedback');

dotenv.config({ path: './server/.env' });

const debugData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected'.cyan.underline);

        console.log('\n--- Data Debug Report ---');

        // 1. Check Totals
        const userCount = await User.countDocuments();
        const studentCount = await User.countDocuments({ role: 'student' });
        const courseCount = await Course.countDocuments();
        const feedbackCount = await Feedback.countDocuments();

        console.log(`Total Users: ${userCount}`);
        console.log(`Total Students: ${studentCount}`);
        console.log(`Total Courses: ${courseCount}`);
        console.log(`Total Feedbacks: ${feedbackCount}`);

        // 2. Check Student Enrollments
        const studentsWithCourses = await User.countDocuments({ role: 'student', courses: { $not: { $size: 0 } } });
        console.log(`Students with at least 1 course: ${studentsWithCourses} / ${studentCount}`);

        // 3. Check Course Analytics
        const coursesWithStudents = await Course.countDocuments({ 'analytics.studentCount': { $gt: 0 } });
        console.log(`Courses reporting > 0 students: ${coursesWithStudents} / ${courseCount}`);

        // 4. Sample Course Check
        if (courseCount > 0) {
            const sampleCourse = await Course.findOne();
            console.log(`\nSample Course: ${sampleCourse.name} (${sampleCourse.code})`);
            console.log(`- Reported Student Count: ${sampleCourse.analytics?.studentCount}`);

            const actualEnrolled = await User.countDocuments({ role: 'student', courses: sampleCourse._id });
            console.log(`- Actual Enrolled Students (User query): ${actualEnrolled}`);

            const actualFeedbacks = await Feedback.countDocuments({ course: sampleCourse._id });
            console.log(`- Feedbacks for this course: ${actualFeedbacks}`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

debugData();
