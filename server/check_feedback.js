const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Feedback = require('./models/Feedback');
const Course = require('./models/Course');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        const feedbackCount = await Feedback.countDocuments();
        console.log(`Total Feedback Entries: ${feedbackCount}`);

        const courseCount = await Course.countDocuments();
        console.log(`Total Courses: ${courseCount}`);

        if (feedbackCount > 0) {
            const sample = await Feedback.findOne().populate('course');
            console.log('Sample Feedback:', JSON.stringify(sample, null, 2));
        }

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkData();
