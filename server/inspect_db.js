require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const CourseRequest = require('./models/CourseRequest');
const User = require('./models/User');

async function inspectData() {
    await mongoose.connect(process.env.MONGO_URI);

    const courses = await Course.find({});
    const requests = await CourseRequest.find({}).populate('student');
    const users = await User.find({});

    console.log('--- DB SUMMARY ---');
    console.log(`Total Courses: ${courses.length}`);
    console.log(`Total Requests: ${requests.length}`);
    console.log(`Total Users: ${users.length}`);

    const uniqueDepts = [...new Set(courses.map(c => c.department))];
    console.log(`Unique Departments (Courses): ${uniqueDepts.length}`);

    if (requests.length > 0) {
        console.log('\n--- SAMPLE REQUESTS ---');
        requests.slice(0, 5).forEach(r => {
            console.log(`ID: ${r._id}, Name: ${r.courseName}, Student: ${r.student ? r.student.name : 'NULL'}`);
        });
    }

    process.exit();
}

inspectData();
