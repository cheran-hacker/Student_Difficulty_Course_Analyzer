const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Total users: ${users.length}`);

        const students = await User.find({ role: 'student' });
        console.log(`Students found with role='student': ${students.length}`);

        const admins = await User.find({ role: 'admin' });
        console.log(`Admins found with role='admin': ${admins.length}`);

        users.forEach(u => {
            console.log(`User: ${u.name}, Email: ${u.email}, Role: '${u.role}', XP: ${u.xp}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
