const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const CourseRequest = require('./server/models/CourseRequest');
const User = require('./server/models/User');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const requests = await CourseRequest.find({}).populate('student');
        console.log(`Found ${requests.length} total requests.\n`);

        requests.forEach((req, i) => {
            console.log(`Request ${i + 1}:`);
            console.log(`- ID: ${req._id}`);
            console.log(`- Course: ${req.courseCode} (${req.courseName})`);
            console.log(`- Student Ref: ${req.student ? req.student.name : 'NULL/MISSING'}`);
            if (!req.student) {
                console.log(`  - RAW Student ID: ${req.get('student', null, { getters: false })}`);
            }
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
