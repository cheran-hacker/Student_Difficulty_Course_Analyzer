const User = require('../models/User');

// XP Thresholds for Levels
const LEVEL_THRESHOLDS = {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000,
    6: 2000,
    7: 5000,
    8: 10000
};

const calculateLevel = (xp) => {
    let level = 1;
    for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
        if (xp >= threshold) level = parseInt(lvl);
    }
    return level;
};

// Award XP to a user
const awardXP = async (userId, amount, actionType) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const oldLevel = user.level;
        user.xp += amount;

        // Check for Level Up
        const newLevel = calculateLevel(user.xp);
        let leveledUp = false;

        if (newLevel > oldLevel) {
            user.level = newLevel;
            leveledUp = true;
            // TODO: Create a notification for level up
        }

        // Check for Streaks (Simple Daily Login Logic)
        if (actionType === 'LOGIN') {
            const today = new Date().setHours(0, 0, 0, 0);
            const lastLogin = user.streak.lastLogin ? new Date(user.streak.lastLogin).setHours(0, 0, 0, 0) : 0;

            if (today > lastLogin) {
                // If last login was yesterday, increment. Else reset.
                const oneDay = 24 * 60 * 60 * 1000;
                if (today - lastLogin === oneDay) {
                    user.streak.current += 1;
                } else if (today - lastLogin > oneDay) {
                    user.streak.current = 1;
                }
                user.streak.lastLogin = new Date();
            }
        }

        await user.save();
        return {
            newXP: user.xp,
            newLevel,
            leveledUp,
            streak: user.streak.current
        };
    } catch (error) {
        console.error('Gamification Error:', error);
        return null;
    }
};

module.exports = { awardXP };
