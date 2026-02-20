const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const fixUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = 'one@bitsathy.ac.in';
        let user = await User.findOne({ email });

        if (!user) {
            console.log('User not found. Creating...');
            user = new User({
                name: 'Prof One',
                email: email,
                password: 'cheran', // Will be hashed by pre-save
                role: 'faculty',
                department: 'CSE'
            });
        } else {
            console.log('User found. Resetting role and password...');
            user.role = 'faculty';
            user.password = 'cheran'; // Will be hashed by pre-save
        }

        await user.save();
        console.log('User fixed successfully.');
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('Password set to: cheran');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixUser();
