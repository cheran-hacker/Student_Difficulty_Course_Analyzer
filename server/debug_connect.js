const mongoose = require('mongoose');
require('dotenv').config();

console.log('Attempting to connect to:', process.env.MONGO_URI ? 'URI defined' : 'URI missing');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        console.log('MongoDB Connected');
        process.exit(0);
    } catch (err) {
        console.error('Connection Error:', err.message);
        process.exit(1);
    }
};

connectDB();
