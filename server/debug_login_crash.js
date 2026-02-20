const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

dotenv.config();

const testLogin = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'one@bitsathy.ac.in';
        console.log(`Testing login for: ${email}`);

        let user = await Admin.findOne({ email });
        let collection = 'Admin';

        if (!user) {
            console.log('Not found in Admin, checking User...');
            user = await User.findOne({ email });
            collection = 'User';
        }

        if (!user) {
            console.log('User not found in DB.');
            process.exit(0);
        }

        console.log(`Found user in ${collection}:`, user.name);
        console.log('Role:', user.role);

        // Test password match (assuming 'cheran' from screenshot, or whatever valid password)
        // User attempted 'cheran' in screenshot
        const isMatch = await user.matchPassword('cheran');
        console.log('Password match result:', isMatch);

        // Simulate gamification parts?
        // const { addXP } = require('../services/gamificationService');
        // await addXP(...) 
        // We can just check if User model has methods

        console.log('Login logic test complete.');
        process.exit(0);

    } catch (error) {
        console.error('CRASH DETECTED:', error);
        process.exit(1);
    }
};

testLogin();
