const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await User.countDocuments();
        console.log(`User Count: ${count}`);

        if (count > 0) {
            const admin = await User.findOne({ role: 'admin' });
            if (admin) {
                console.log(`Admin found: ${admin.email}`);
            } else {
                console.log('No admin user found.');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
check();
