const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./server/models/User');
const Course = require('./server/models/Course');
const Feedback = require('./server/models/Feedback');

dotenv.config({ path: './server/.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

const departments = ['CSE', 'IT', 'ECE', 'AIDS', 'AIML', 'EEE', 'Mechanical', 'Civil', 'Biotechnology', 'Food Technology'];

const importData = async () => {
    try {
        await connectDB();
        await Course.deleteMany({ department: { $in: departments } });

        const courses = [];
        departments.forEach(dept => {
            for (let i = 1; i <= 3; i++) {
                courses.push({
                    code: `${dept}-${100 + i}`,
                    name: `${dept} Core Subject ${i}`,
                    department: dept,
                    semester: '1',
                    description: `Core subject for ${dept}`,
                    instructors: ['Dr. Expert'],
                    uploadStatus: i === 1 ? 'completed' : (i === 2 ? 'processing' : 'pending'),
                    syllabus: i === 1 ? {
                        originalName: `Syllabus_${dept}_${i}.pdf`,
                        path: `uploads/syllabi/dummy_${dept}_${i}.pdf`,
                        size: 1542000,
                        mimeType: 'application/pdf',
                        uploadedAt: new Date(),
                        topicCount: 15
                    } : null,
                    analytics: {
                        studentCount: Math.floor(Math.random() * 100) + 20,
                        completionRate: Math.floor(Math.random() * 40) + 60
                    }
                });
            }
        });

        await Course.insertMany(courses);
        console.log('FOCUSED SEEDING COMPLETE!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
}

importData();
