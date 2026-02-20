const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkLeaderboard = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const studentCount = await User.countDocuments({ role: 'student' });
        console.log(`Total students: ${studentCount}`);

        if (studentCount > 0) {
            const top5 = await User.find({ role: 'student' })
                .sort({ xp: -1 })
                .limit(5)
                .select('name xp level role');

            console.log('Top 5 Students:');
            console.table(top5.map(s => ({
                id: s._id,
                name: s.name,
                xp: s.xp,
                level: s.level,
                role: s.role
            })));
        } else {
            console.log('No students found. Checking all users...');
            const allUsers = await User.find({}).limit(5).select('name role');
            console.log('Sample users:', allUsers);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkLeaderboard();
