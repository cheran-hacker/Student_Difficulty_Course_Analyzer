const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./server/models/User');
const connectDB = require('./server/config/db');

dotenv.config({ path: './server/.env' });

const verify = async () => {
    try {
        await connectDB();

        // 1. Check User Schema for 'courses' field
        const userSchemaFields = Object.keys(User.schema.paths);
        if (userSchemaFields.includes('courses')) {
            console.log('✓ User model updated with "courses" field.');
        } else {
            console.error('✗ User model missing "courses" field.');
        }

        // 2. Check for students
        const studentCount = await User.countDocuments({ role: 'student' });
        console.log(`Current Student Count: ${studentCount}`);
        if (studentCount === 0) {
            console.log('✓ All sample students purged successfully.');
        } else {
            console.warn(`! There are still ${studentCount} students in the database.`);
        }

        process.exit();
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
