const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const purge = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected.');

        const db = mongoose.connection.db;

        console.log('Deleting all courses...');
        const result = await db.collection('courses').deleteMany({});
        console.log(`Deleted ${result.deletedCount} courses.`);

        console.log('Deleting all requests...');
        await db.collection('courserequests').deleteMany({});

        console.log('Database cleared.');
        process.exit(0);
    } catch (err) {
        console.error('Purge failed:', err.message);
        process.exit(1);
    }
};

purge();
