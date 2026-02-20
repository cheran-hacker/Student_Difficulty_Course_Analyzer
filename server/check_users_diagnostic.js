const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const students = await User.find({ role: 'student' });
        const faculty = await User.find({ role: 'faculty' });
        const admins = await User.find({ role: 'admin' });

        console.log('--- USER SUMMARY ---');
        console.log(`Total Students: ${students.length}`);
        console.log(`Total Faculty: ${faculty.length}`);
        console.log(`Total Admins: ${admins.length}`);

        if (students.length > 0) {
            console.log('\nFirst 5 Students:');
            students.slice(0, 5).forEach(s => console.log(`- ${s.name} (${s.email}) - ID: ${s._id}`));
        } else {
            console.log('\nWARNING: No students found in database!');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkUsers();
