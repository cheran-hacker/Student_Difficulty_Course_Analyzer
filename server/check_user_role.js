const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = 'one@bitsathy.ac.in';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User found:', user.name);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('ID:', user._id);
        } else {
            console.log('User not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
