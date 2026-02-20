const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const assignFaculty = async () => {
    await connectDB();

    try {
        const faculty = await User.find({ role: 'faculty' });
        if (faculty.length === 0) {
            console.log('No faculty found. Please seed faculty first.');
            process.exit(1);
        }

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses and ${faculty.length} faculty members.`);

        let updatedCount = 0;
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const assignedFaculty = faculty[i % faculty.length];

            // Overwrite instructors with the single assigned faculty email
            course.instructors = [assignedFaculty.email];
            await course.save();
            updatedCount++;
        }

        console.log(`Successfully assigned faculty to ${updatedCount} courses.`);
        process.exit(0);

    } catch (error) {
        console.error('Error assigning faculty:', error);
        process.exit(1);
    }
};

assignFaculty();
