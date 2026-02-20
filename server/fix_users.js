const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const fs = require('fs');

dotenv.config();

const logFile = 'fix_log.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

const fixUsers = async () => {
    try {
        log('Starting fixUsers script...');
        await mongoose.connect(process.env.MONGO_URI);
        log('MongoDB Connected');

        const users = await User.find({});
        log(`Total users found: ${users.length}`);

        let updatedCount = 0;
        for (const user of users) {
            log(`Checking user: ${user.name} (${user.email}), Role: ${user.role}`);

            if (!user.role || (user.role !== 'student' && user.role !== 'admin')) {
                log(`-> Updating role for ${user.name} to 'student'`);
                user.role = 'student';
                await user.save();
                updatedCount++;
            }
        }

        log(`Total users updated: ${updatedCount}`);

        const students = await User.find({ role: 'student' });
        log(`Verification: Students with role='student': ${students.length}`);

        process.exit();
    } catch (error) {
        log('Error: ' + error.message);
        process.exit(1);
    }
};

fixUsers();
