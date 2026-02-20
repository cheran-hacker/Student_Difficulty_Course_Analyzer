const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_analyzer');
        const email = 'cheran@123';
        const password = 'cheran@123';

        console.log(`Checking user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User NOT FOUND in DB');
            process.exit(1);
        }

        console.log('User found.');
        console.log(`Stored Hash: ${user.password}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Bcrypt Compare Result for '${password}': ${isMatch}`);

        if (!isMatch) {
            console.log('--- FIXING PASSWORD ---');
            // Manually hash and save
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Bypass pre-save hook by using updateOne instead of save if needed, 
            // but let's try direct update first.
            // Actually, let's just use the model's updateOne to set the hash directly
            // to avoid any double-hashing issues in pre-save hooks if we were using .save() incorrectly.

            await User.updateOne({ _id: user._id }, { password: hashedPassword });
            console.log('Password forcefully updated with fresh hash.');

            // Verify again
            const newUser = await User.findById(user._id);
            const isMatchNow = await bcrypt.compare(password, newUser.password);
            console.log(`Verification after fix: ${isMatchNow}`);
        }

    } catch (e) {
        console.error(e);
    }
    process.exit();
};

verify();
