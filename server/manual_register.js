const mongoose = require('mongoose');
const User = require('./models/User');

const dotenv = require('dotenv');
dotenv.config();

const manualRegister = async () => {
    try {
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_analyzer');
        console.log('2. Connected.');

        const testEmail = 'test_manual_' + Date.now() + '@bitsathy.ac.in'; // Using valid domain for consistency
        console.log(`3. Attempting to create user with email: ${testEmail}`);

        const user = await User.create({
            name: 'Manual Test Student',
            email: testEmail,
            password: 'password123',
            role: 'student',
            studentId: 'MANUAL_' + Date.now(),
            department: 'Computer Science & Engineering', // Updated to match proper department
            year: 'III' // Updated to match Roman numeral format
        });

        console.log('4. User created successfully:', user);

        console.log('5. Verifying fetch...');
        const foundUser = await User.findById(user._id);
        if (foundUser) {
            console.log('6. User found in DB:', foundUser.name);
        } else {
            console.error('6. CRITICAL: User created but NOT found immediately after!');
        }

        process.exit();
    } catch (error) {
        console.error('ERROR during manual registration:', error);
        process.exit(1);
    }
};

manualRegister();
