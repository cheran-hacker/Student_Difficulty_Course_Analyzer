const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('../models/Course');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const courses = await Course.find({}).limit(5);
        console.log('Sample courses:', JSON.stringify(courses, null, 2));

        const assignedCount = await Course.countDocuments({ instructors: { $not: { $size: 0 } } });
        console.log(`Courses with instructors: ${assignedCount}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyCourses();
