const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ role: 'student' });
        console.log('--- STUDENT USERS ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}, Name: ${u.name}, Dept: ${u.department}, Role: ${u.role}`);
        });
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
check();
