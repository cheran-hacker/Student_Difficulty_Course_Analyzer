const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_analyzer');
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'student' }).select('name email department courses');
        console.log('Registered Students:');
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) | Dept: ${u.department} | Courses: ${u.courses.length}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

listUsers();
