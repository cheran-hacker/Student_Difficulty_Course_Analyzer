const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');

dotenv.config({ path: path.join(__dirname, '../.env') });

const deleteSampleFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // database names to delete
        const namesToDelete = ['Dr. Faculty', 'Prof. Lecturer'];

        // Find users
        const users = await User.find({ name: { $in: namesToDelete } });
        console.log(`Found ${users.length} sample users to delete.`);

        if (users.length > 0) {
            const result = await User.deleteMany({ name: { $in: namesToDelete } });
            console.log(`Deleted ${result.deletedCount} users.`);
        }

        // Also check if these names are hardcoded in any course 'instructors' array and remove them
        const courses = await Course.find({ instructors: { $in: namesToDelete } });
        console.log(`Found ${courses.length} courses with sample instructor names.`);

        for (const course of courses) {
            course.instructors = course.instructors.filter(name => !namesToDelete.includes(name));
            await course.save();
            console.log(`cleaned course: ${course.code}`);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

deleteSampleFaculty();
