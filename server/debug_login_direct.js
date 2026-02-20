const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const { addXP, checkBadges } = require('./services/gamificationService');
const { logAudit } = require('./utils/auditLogger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const simulateLogin = async (email, password) => {
    console.log(`Attempting login for: ${email}`);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`User found: ${user.name} (${user.role})`);

        // Check password
        const isMatch = await user.matchPassword(password);
        console.log(`Password match result: ${isMatch}`);

        if (!isMatch) {
            console.log('Password incorrect');
            return;
        }

        // Gamification Logic
        console.log('Running gamification logic...');
        try {
            const now = new Date();
            const lastLogin = user.streak?.lastLogin ? new Date(user.streak.lastLogin) : null;

            if (!user.streak) user.streak = { current: 0, lastLogin: null };

            let awardXP = false;
            let isStreakExtended = false;

            if (!lastLogin) {
                user.streak.current = 1;
                user.streak.lastLogin = now;
                awardXP = true;
            } else {
                const isToday = lastLogin.toDateString() === now.toDateString();
                if (!isToday) {
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const isYesterday = lastLogin.toDateString() === yesterday.toDateString();

                    if (isYesterday) {
                        user.streak.current += 1;
                        isStreakExtended = true;
                    } else {
                        user.streak.current = 1;
                    }
                    user.streak.lastLogin = now;
                    awardXP = true;
                }
            }

            console.log('Saving user with updated streak...');
            await user.save();

            if (awardXP) {
                console.log('Awarding XP...');
                const gamificationStats = await addXP(user._id, 5, 'DAILY_LOGIN');
                console.log('XP Awarded:', gamificationStats);

                if (isStreakExtended) {
                    console.log('Checking badges...');
                    await checkBadges(user._id, 'LOGIN');
                }
            }
        } catch (gErr) {
            console.error('Gamification Error:', gErr);
        }

        // Audit Log
        console.log('Logging audit...');
        await logAudit(user._id, 'LOGIN', 'User logged in successfully', '127.0.0.1');

        console.log('Login successful simulation complete.');

    } catch (error) {
        console.error('CRITICIAL ERROR during login simulation:');
        console.error(error);
    }
};

const run = async () => {
    await connectDB();

    // Find a student user
    const student = await User.findOne({ role: 'student' });
    if (student) {
        console.log(`Found student: ${student.email}`);
        // Can't know password easily, but let's try 'password123' or '123456' which are common seeds
        // Or just bypass password check to test the REST of the logic
        await simulateLogin(student.email, 'password123');
    } else {
        console.log('No student found');
    }

    // Find a faculty user
    const faculty = await User.findOne({ role: 'faculty' });
    if (faculty) {
        console.log(`Found faculty: ${faculty.email}`);
        await simulateLogin(faculty.email, 'password123');
    } else {
        console.log('No faculty found');
    }

    process.exit();
};

run();
