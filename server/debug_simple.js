const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected');
        const count = await User.countDocuments({ role: 'student' });
        console.log('Student count:', count);
        if (count > 0) {
            const students = await User.find({ role: 'student' }).select('name xp role').limit(5);
            console.log('Sample students:', students);
        } else {
            console.log('No students found. Checking all users...');
            const all = await User.find({}).select('name role').limit(5);
            console.log('All users sample:', all);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
