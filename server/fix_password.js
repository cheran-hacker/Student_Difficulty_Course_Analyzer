const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const fix = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_analyzer');
        const user = await User.findOne({ email: 'cheran@123' });
        if (user) {
            console.log('User found. Updating password...');
            user.password = 'cheran@123';
            await user.save(); // Triggers pre-save hook
            console.log('SUCCESS: Password updated to: cheran@123');
        } else {
            console.log('ERROR: User cheran@123 not found!');
            // Create if missing
            await User.create({
                name: 'Cheran Admin',
                email: 'cheran@123',
                password: 'cheran@123',
                role: 'admin',
            });
            console.log('CREATED: User created with password: cheran@123');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
fix();
