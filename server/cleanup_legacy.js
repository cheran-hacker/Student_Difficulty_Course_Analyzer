require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const cleanUp = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Remove courses with '&' in department name (legacy), keep 'and' (new standard)
        // Exceptions: 'AI & DS' might be valid if we standardized on that? 
        // Let's check the list:
        // mega_seeder.js uses: 'Artificial Intelligence and Data Science', 'Computer Science and Engineering'
        // So '&' is definitely legacy (e.g. 'Computer Science & Engineering').

        console.log('Cleaning up legacy departments with "&"...');

        // Delete courses where department contains '&' BUT NOT specific valid ones if any?
        // Actually, all new ones from mega_seeder use 'and' or full words.
        // Let's list what we are about to delete first.

        const legacyCourses = await Course.find({ department: /&/ });
        console.log(`Found ${legacyCourses.length} courses with "&" in department name.`);

        if (legacyCourses.length > 0) {
            const deleteResult = await Course.deleteMany({ department: /&/ });
            console.log(`Deleted ${deleteResult.deletedCount} legacy courses.`);
        }

        const remaining = await Course.countDocuments();
        console.log(`Total Remaining Courses: ${remaining}`);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

cleanUp();
