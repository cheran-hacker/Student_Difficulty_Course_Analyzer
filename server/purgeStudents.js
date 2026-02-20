const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const purgeStudents = async () => {
    try {
        await connectDB();
        const result = await User.deleteMany({ role: 'student' });
        console.log(`Script Logic: Purged ${result.deletedCount} student records.`);
        console.log('Admin accounts and Course data remain intact.');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

purgeStudents();
