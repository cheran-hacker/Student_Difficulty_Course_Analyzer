require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const quickCheck = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);

        const count = await Course.countDocuments({});
        console.log(`\n✅ Total Courses: ${count}`);

        if (count > 0) {
            const sample = await Course.findOne({});
            console.log(`\nSample Course:`);
            console.log(JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

quickCheck();
