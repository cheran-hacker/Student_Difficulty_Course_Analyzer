
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CourseRequest = require('./models/CourseRequest');

dotenv.config();

const countRequests = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_analyzer');
        const count = await CourseRequest.countDocuments();
        const pending = await CourseRequest.countDocuments({ status: 'pending' });
        const approved = await CourseRequest.countDocuments({ status: 'approved' });

        console.log(`\n================================`);
        console.log(`📊 DATABASE REQUEST SUMMARY`);
        console.log(`================================`);
        console.log(`Total Requests:   ${count}`);
        console.log(`Pending:         ${pending}`);
        console.log(`Approved:        ${approved}`);
        console.log(`================================\n`);

        process.exit();
    } catch (error) {
        console.error('Error counting requests:', error);
        process.exit(1);
    }
};

countRequests();
