const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const facultyEmail = 'faculty@bitsathy.ac.in';
        let faculty = await User.findOne({ email: facultyEmail });

        if (!faculty) {
            faculty = await User.create({
                name: 'Dr. Faculty Test',
                email: facultyEmail,
                password: 'password123',
                role: 'faculty',
                department: 'Computer Science'
            });
            console.log('Faculty user created:', faculty);
        } else {
            console.log('Faculty user already exists:', faculty);
            if (faculty.role !== 'faculty') {
                faculty.role = 'faculty';
                await faculty.save();
                console.log('Updated role to faculty');
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

createFaculty();
