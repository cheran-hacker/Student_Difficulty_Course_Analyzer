require('dotenv').config();
const mongoose = require('mongoose');

// Ultra-simple connection test  
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 3000
})
    .then(() => {
        console.log('✅ Connected to MongoDB!');
        return mongoose.connection.db.admin().ping();
    })
    .then(() => {
        console.log('✅ Ping successful!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ MongoDB Error:', err.message);
        console.error('\n💡 Possible solutions:');
        console.error('1. Start MongoDB service: net start MongoDB');
        console.error('2. Check if MongoDB is running on port 27017');
        console.error('3. Verify MONGO_URI in .env file');
        process.exit(1);
    });

setTimeout(() => {
    console.error('⏱️ Timeout after 5 seconds - MongoDB not responding');
    process.exit(1);
}, 5000);
