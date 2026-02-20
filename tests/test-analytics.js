const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const { aggregateCourseData } = require('./server/services/analyticsService');
const Course = require('./server/models/Course');
const Feedback = require('./server/models/Feedback'); // Ensure model is registered

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const course = await Course.findOne();
        if (!course) {
            console.log('No courses found.');
            process.exit(0);
        }

        console.log(`Testing analytics for course: ${course.code}`);
        console.time('Analytics');
        const data = await aggregateCourseData(course._id);
        console.timeEnd('Analytics');

        console.log('Result:', JSON.stringify(data, null, 2));
        process.exit(0);
    } catch (e) {
        console.error('TEST_ERROR:', e);
        process.exit(1);
    }
}
test();
