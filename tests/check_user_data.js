const mongoose = require('mongoose');
const User = require('./server/models/User');
const Course = require('./server/models/Course');
require('dotenv').config();

const checkUser = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_analyzer');
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email }).populate('courses');
        if (!user) {
            console.log(`User with email ${email} not found`);
            return;
        }

        console.log('User Data:', {
            id: user._id,
            name: user.name,
            email: user.email,
            department: user.department,
            registeredCoursesCount: user.courses.length,
            registeredCourses: user.courses.map(c => ({ id: c._id, code: c.code, name: c.name, department: c.department }))
        });

        const allCoursesCount = await Course.countDocuments();
        console.log('Total Courses in DB:', allCoursesCount);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

const emailToCheck = process.argv[2] || 'student@bitsathy.ac.in'; // Default or provided
checkUser(emailToCheck);
