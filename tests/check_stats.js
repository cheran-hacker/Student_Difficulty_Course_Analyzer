const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const Course = require('./server/models/Course');
const Feedback = require('./server/models/Feedback');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const courses = await Course.countDocuments();
        const feedbacks = await Feedback.countDocuments();
        console.log(`Courses: ${courses}`);
        console.log(`Feedbacks: ${feedbacks}`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
