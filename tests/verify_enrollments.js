const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./server/models/User');
const Course = require('./server/models/Course');

dotenv.config({ path: './server/.env' });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const course = await Course.findOne();
        if (!course) {
            console.log('No courses found.');
            process.exit();
        }
        console.log(`Checking First Course: ${course.name} (${course._id})`);

        const students = await User.find({ role: 'student' }).limit(5);
        console.log(`Checking 5 Random Students:`);
        students.forEach(s => {
            console.log(`- ${s.name}: Courses Enrolled: ${s.courses.length} [${s.courses}]`);
        });

        const enrolledInSample = await User.countDocuments({
            role: 'student',
            courses: course._id
        });
        console.log(`\nSpecific check: Students enrolled in ${course.code}: ${enrolledInSample}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
