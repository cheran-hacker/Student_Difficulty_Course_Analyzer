require('dotenv').config();
const mongoose = require('mongoose');
const CourseRequest = require('./models/CourseRequest');
const User = require('./models/User');

async function seedRequests() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const students = await User.find({ role: 'student' }).limit(5);
        if (students.length === 0) {
            console.log('No students found to associate with requests.');
            process.exit(0);
        }

        const sampleRequests = [
            {
                student: students[0]._id,
                courseName: 'Advanced Quantum Mechanics',
                courseCode: 'PHYS401',
                department: 'Physics',
                semester: 'Semester 7',
                reason: 'Need for research project',
                status: 'pending'
            },
            {
                student: students[Math.min(1, students.length - 1)]._id,
                courseName: 'Deep Learning Specialization',
                courseCode: 'AI602',
                department: 'Artificial Intelligence',
                semester: 'Semester 6',
                reason: 'Career interest in ML',
                status: 'pending'
            },
            {
                student: students[Math.min(2, students.length - 1)]._id,
                courseName: 'Blockchain Architecture',
                courseCode: 'CS705',
                department: 'Computer Science',
                semester: 'Semester 8',
                reason: 'Capstone project requirement',
                status: 'pending'
            }
        ];

        console.log('Seeding 3 sample course requests...');
        await CourseRequest.insertMany(sampleRequests);
        console.log('Sample requests seeded successfully.');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding requests:', err);
        process.exit(1);
    }
}

seedRequests();
