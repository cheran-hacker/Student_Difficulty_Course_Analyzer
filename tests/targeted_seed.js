const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Course = require('./server/models/Course');

async function nuclear() {
    console.log('Nuke initiated...');
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to DB');

        console.log('Purging...');
        await Course.deleteMany({});

        const favorites = [
            'CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Biotech',
            'Aerospace', 'Automobile', 'Mechatronics', 'Robotics', 'CyberSecurity',
            'DataScience', 'AIML', 'AIDS', 'Marine', 'Petroleum', 'Textile',
            'Instrumentation', 'Production', 'Industrial', 'Agriculture', 'FoodTech'
        ];
        const courses = [];

        favorites.forEach(dept => {
            for (let i = 1; i <= 1; i++) {
                courses.push({
                    code: `${dept}-${100 + i}`,
                    name: `${dept} Specialty Module ${i}`,
                    department: dept,
                    semester: '1',
                    description: `Crucial module for ${dept} students.`,
                    instructors: ['Dr. System']
                });
            }
        });

        console.log('Inserting favorite branches...');
        await Course.insertMany(courses);
        console.log('TARGETED SEED COMPLETE!');
        process.exit();
    } catch (err) {
        console.error('NUKE_FAILED:', err.message);
        process.exit(1);
    }
}

nuclear();
