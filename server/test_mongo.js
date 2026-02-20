const mongoose = require('mongoose');

// Quick MongoDB test
const test = async () => {
    try {
        console.log('Testing MongoDB connection...');
        await mongoose.connect('mongodb://127.0.0.1:27017/student_analyzer', {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB Connected!');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log(`\nCollections: ${collections.map(c => c.name).join(', ')}`);

        const Course = mongoose.connection.collection('courses');
        const count = await Course.countDocuments();
        console.log(`\nCourses count: ${count}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        process.exit(1);
    }
};

test();
