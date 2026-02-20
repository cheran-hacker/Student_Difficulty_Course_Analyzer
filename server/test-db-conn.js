const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Attempting to connect to MongoDB...');
console.log('URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('✅ MongoDB Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:');
        console.error(err.message);
        process.exit(1);
    });
