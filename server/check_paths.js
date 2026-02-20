const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config();

const checkSyllabusPaths = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_analyzer');
        console.log('DB Connected');

        const courses = await Course.find({ 'syllabus.path': { $exists: true } });
        console.log(`Found ${courses.length} courses with syllabuses:`);

        courses.forEach(c => {
            console.log(`Course: ${c.name} (${c.code})`);
            console.log(`Path: ${c.syllabus.path}`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSyllabusPaths();
