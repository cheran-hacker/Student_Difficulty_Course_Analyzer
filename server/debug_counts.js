require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const CourseRequest = require('./models/CourseRequest');

async function debugData() {
    await mongoose.connect(process.env.MONGO_URI);
    const courseCount = await Course.countDocuments();
    const requestCount = await CourseRequest.countDocuments();
    console.log(`Courses: ${courseCount}`);
    console.log(`Course Requests: ${requestCount}`);
    process.exit();
}

debugData();
