const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Admin = require('./models/Admin');

dotenv.config();

const connectDB = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting:', err);
        process.exit(1);
    }
};

const checkUser = async () => {
    await connectDB();
    const id = '698d4eaf1056825380ff7baa';
    console.log(`Checking for user ID: ${id}`);

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid ObjectId format');
            return;
        }

        const user = await User.findById(id);
        if (user) {
            console.log('Found in User collection:', user.email, user.role);
        } else {
            console.log('Not found in User collection');
        }

        const admin = await Admin.findById(id);
        if (admin) {
            console.log('Found in Admin collection:', admin.email, admin.role);
        } else {
            console.log('Not found in Admin collection');
        }
    } catch (error) {
        console.error('Error querying DB:', error);
    } finally {
        mongoose.disconnect();
    }
};

checkUser();
