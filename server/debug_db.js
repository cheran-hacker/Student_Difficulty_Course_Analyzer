const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const debugDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/student_analyzer');
        console.log('Connected to DB');

        const email = 'admin@university.edu';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User NOT FOUND:', email);
        } else {
            console.log('User FOUND:', user.email);
            console.log('Stored Hash:', user.password);

            const isMatch = await bcrypt.compare('secureAdmin123', user.password);
            console.log('Testing password "secureAdmin123":', isMatch ? 'MATCH' : 'NO MATCH');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugDB();
