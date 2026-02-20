const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const { addXP, checkBadges, LEVEL_THRESHOLDS } = require('./services/gamificationService');

dotenv.config();

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`.cyan.underline);

        // 1. Get a Test User (or create one)
        let user = await User.findOne({ email: 'gamification_test@bitsathy.ac.in' });
        if (!user) {
            console.log("Creating test user...");
            user = await User.create({
                name: 'Gamification Tester',
                email: 'gamification_test@bitsathy.ac.in',
                password: 'password123',
                role: 'student',
                xp: 0,
                level: 1
            });
        } else {
            // Reset for test
            user.xp = 0;
            user.level = 1;
            user.badges = [];
            await user.save();
            console.log("Test user reset.");
        }

        console.log(`Testing with User: ${user.name} (Lvl ${user.level}, XP ${user.xp})`.yellow);

        // 2. Test Adding XP (Small Amount)
        console.log(`\n--- Test 1: Add Small XP (100) ---`.cyan);
        let result = await addXP(user._id, 100, 'TEST_ACTION');
        console.log(`Added 100 XP. New XP: ${result.newXP}, Level: ${result.newLevel}`);
        if (result.newXP !== 100 || result.newLevel !== 1) throw new Error("XP/Level mismatch after small add.");

        // 3. Test Level Up (Cross 200 XP -> Level 2)
        console.log(`\n--- Test 2: Level Up to 2 (Add 150 XP) ---`.cyan);
        result = await addXP(user._id, 150, 'BIG_ACTION'); // Total 250
        console.log(`Added 150 XP. New XP: ${result.newXP}, Level: ${result.newLevel}`);
        if (result.newLevel !== 2 || !result.leveledUp) throw new Error("Failed to level up to 2.");
        console.log("✅ Level Up 2 Detected!");

        // 4. Test Badge Trigger (Level 5 @ 1000 XP)
        console.log(`\n--- Test 3: Level 5 Badge (Scholar) ---`.cyan);
        // Add enough XP to reach Level 5 (Threshold 1000)
        // Current 250. Need 750 more.
        result = await addXP(user._id, 800, 'MEGA_BOOST'); // Total 1050
        console.log(`Added 800 XP. New XP: ${result.newXP}, Level: ${result.newLevel}`);

        // With 1050 XP, user should be Level 5.
        if (result.newLevel !== 5) throw new Error(`Expected Level 5, got Level ${result.newLevel}`);

        user = await User.findById(user._id); // Reload to check badges
        const hasBadge = user.badges.some(b => b.id === 'level_5');
        console.log(`Has 'Scholar' Badge? ${hasBadge}`);

        if (!hasBadge) throw new Error("Level 5 Badge not awarded.");

        console.log(`\n✅ GAMIFICATION MODULE VERIFIED`.green.bold);

        // Cleanup?
        // await User.deleteOne({ _id: user._id }); 

        process.exit();
    } catch (error) {
        console.error(`❌ VERIFICATION FAILED: ${error.message}`.red.bold);
        process.exit(1);
    }
};

runVerification();
