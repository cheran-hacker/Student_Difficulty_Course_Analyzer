const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if users exist
        const count = await User.countDocuments({ role: 'student' });
        if (count > 5) {
            console.log('Users already exist. Skipping seed.');
            process.exit(0);
        }

        console.log('Seeding Users...');

        const departments = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
        const users = [];

        const password = await bcrypt.hash('123456', 10);

        for (let i = 1; i <= 25; i++) {
            const dept = departments[Math.floor(Math.random() * departments.length)];
            const xp = Math.floor(Math.random() * 50000); // Random XP up to Level 18

            // Calculate Level based on XP (approximate reverse of logic)
            let level = 1;
            const LEVEL_THRESHOLDS = [0, 200, 400, 700, 1000, 1500, 2200, 3000, 4000, 5000, 6500, 8500, 11000, 14000, 18000, 23000, 30000, 40000, 55000, 75000];
            for (let l = 0; l < LEVEL_THRESHOLDS.length; l++) {
                if (xp >= LEVEL_THRESHOLDS[l]) {
                    level = l + 1;
                }
            }

            users.push({
                name: `Student ${i}`,
                email: `student${i}@bitsathy.ac.in`, // Institutional email
                password: password,
                role: 'student',
                department: dept,
                year: 'III',
                studentId: `737624${100 + i}`,
                xp: xp,
                level: level,
                badges: [],
                streak: { current: Math.floor(Math.random() * 10), lastLogin: new Date() }
            });
        }

        await User.insertMany(users);
        console.log(`Seeded ${users.length} students.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
