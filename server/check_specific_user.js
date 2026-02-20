const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_analyzer');
        const email = 'cheran@123';
        console.log(`Checking for user with email: ${email}`);

        const user = await User.findOne({ email });

        if (user) {
            console.log('User FOUND:', user);
        } else {
            console.log('User NOT FOUND');
        }

        // List all users to be sure
        const allUsers = await User.find({}, 'name email role');
        console.log('--- All Users in DB ---');
        console.log(allUsers);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
