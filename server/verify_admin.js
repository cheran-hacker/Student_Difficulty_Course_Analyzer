const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });

        let output = '';
        if (!admin) {
            output += 'Admin user NOT found.\n';
        } else {
            output += `Admin Found: ${admin.email}\n`;
            output += `Role: ${admin.role}\n`;
            output += `Hashed Password: ${admin.password}\n`;

            const isMatch = await bcrypt.compare(process.env.ADMIN_PASSWORD, admin.password);
            output += `Password Match for '${process.env.ADMIN_PASSWORD}': ${isMatch}\n`;
        }

        fs.writeFileSync('verification.txt', output);
        console.log('Verification complete');
        process.exit();
    } catch (error) {
        fs.writeFileSync('verification.txt', `Error: ${error.message}`);
        process.exit(1);
    }
};

verify();
