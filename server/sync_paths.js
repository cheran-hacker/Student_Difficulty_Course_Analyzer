const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const fs = require('fs');
const path = require('path');

dotenv.config();

const fixPaths = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_analyzer');
        console.log('DB Connected');

        const uploadsDir = path.join(__dirname, 'uploads', 'syllabi');
        const files = fs.readdirSync(uploadsDir);
        console.log('Files on disk:', files);

        const courses = await Course.find({ 'syllabus.path': { $exists: true } });
        console.log(`Found ${courses.length} courses with syllabuses`);

        for (const course of courses) {
            let currentPath = course.syllabus.path;
            const filename = path.basename(currentPath);

            // Look for a close match in files
            const match = files.find(f => {
                // Remove underscores/spaces and compare
                const normalize = s => s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                return normalize(f) === normalize(filename);
            });

            if (match && match !== filename) {
                console.log(`Matching ${filename} -> ${match}`);
                const newPath = path.join('uploads', 'syllabi', match);
                course.syllabus.path = newPath;
                await course.save();
                console.log(`Updated path for ${course.name}`);
            }
        }

        console.log('Path synchronization complete');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixPaths();
