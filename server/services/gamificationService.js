const User = require('../models/User');

// XP Thresholds to match Master Requirements:
// Lvl 1: 0, Lvl 5: 1000, Lvl 10: 5000
const LEVEL_THRESHOLDS = [
    0,      // Lvl 1
    200,    // Lvl 2
    400,    // Lvl 3
    700,    // Lvl 4
    1000,   // Lvl 5 (Scholar)
    1500,   // Lvl 6
    2200,   // Lvl 7
    3000,   // Lvl 8
    4000,   // Lvl 9
    5000,   // Lvl 10 (Dean's List)
    6500,   // Lvl 11
    8500,   // Lvl 12
    11000,  // Lvl 13
    14000,  // Lvl 14
    18000,  // Lvl 15
    23000,  // Lvl 16
    30000,  // Lvl 17
    40000,  // Lvl 18
    55000,  // Lvl 19
    75000   // Lvl 20 (Titan)
];

const BADGES = {
    EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', icon: '🌅' }, // First to review in sem
    HELPER: { id: 'helper', name: 'Helper', icon: '🤝' }, // 10 Upvotes
    CRITIC: { id: 'critic', name: 'Critic', icon: '✍️' }, // 10 Detailed reviews
    STREAK_7: { id: 'streak_7', name: 'Consistent', icon: '🔥' },
    LEVEL_5: { id: 'level_5', name: 'Scholar', icon: '📜' },
    LEVEL_10: { id: 'level_10', name: 'Dean\'s List', icon: '🎓' }
};

/**
 * Get XP Multiplier based on Level/Tier
 * @param {number} level 
 * @returns {number} multiplier
 */
const getMultiplier = (level) => {
    if (level >= 20) return 5.0; // Titan
    if (level >= 15) return 4.0; // Elite
    if (level >= 10) return 3.0; // Dean's List
    if (level >= 5) return 2.0; // Scholar
    return 1.0;                  // Novice
};

/**
 * Add XP to a user and check for level up
 * @param {string} userId
 * @param {number} amount
 * @param {string} reason
 */
const addXP = async (userId, amount, reason) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        // Apply Tier Multiplier
        const multiplier = getMultiplier(user.level || 1);
        const adjustedAmount = Math.round(amount * multiplier);

        user.xp += adjustedAmount;

        // Check for Level Up
        let newLevel = user.level;
        // Find the highest level threshold the user has surpassed
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (user.xp >= LEVEL_THRESHOLDS[i]) {
                newLevel = i + 1; // Levels are 1-indexed
                break;
            }
        }

        let leveledUp = false;
        if (newLevel > user.level) {
            user.level = newLevel;
            leveledUp = true;
            // Check for Level Badges immediately upon leveling
            const levelBadge = await checkBadges(user, 'LEVEL_UP');
            // If a badge was returned, we might want to return it to the frontend via the response
        }

        await user.save();

        // Calculate next threshold
        const nextThreshold = LEVEL_THRESHOLDS[user.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

        return {
            success: true,
            newXP: user.xp,
            newLevel: user.level,
            leveledUp,
            threshold: nextThreshold
        };
    } catch (error) {
        console.error("Gamification Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Check and award badges based on triggers
 * @param {Object} userOrId - Mongoose User object or User ID
 * @param {string} triggerType - 'REVIEW', 'LOGIN', 'LEVEL_UP', 'UPVOTE'
 * @param {Object} context - Optional data (e.g., reviewCount, upvoteCount)
 */
const checkBadges = async (userOrId, triggerType, context = {}) => {
    let user = userOrId;
    if (typeof userOrId === 'string') {
        user = await User.findById(userOrId);
    }
    if (!user) return;

    // Ensure badges array exists
    if (!user.badges) user.badges = [];
    const existingBadges = user.badges.map(b => b.id);
    let newBadge = null;

    if (triggerType === 'REVIEW') {
        // "Early Bird": First review logic requires checking database for other reviews in this semester.
        // For efficiency, we assume the controller passes a flag if this is the first review of the term.
        if (context.isFirstReviewOfTerm && !existingBadges.includes(BADGES.EARLY_BIRD.id)) {
            newBadge = BADGES.EARLY_BIRD;
        }

        // "Critic": 10 Detailed reviews
        // We assume 'context.detailedReviewCount' contains the up-to-date count
        if (context.detailedReviewCount >= 10 && !existingBadges.includes(BADGES.CRITIC.id)) {
            newBadge = BADGES.CRITIC;
        }
    }

    if (triggerType === 'UPVOTE') {
        // "Helper": 10 Upvotes on a single review (or total? Requirements say "Your review got 10 upvotes" -> singular)
        if (context.upvoteCount >= 10 && !existingBadges.includes(BADGES.HELPER.id)) {
            newBadge = BADGES.HELPER;
        }
    }

    if (triggerType === 'LOGIN') {
        if (user.streak && user.streak.current >= 7 && !existingBadges.includes(BADGES.STREAK_7.id)) {
            newBadge = BADGES.STREAK_7;
        }
    }

    if (triggerType === 'LEVEL_UP') {
        if (user.level >= 5 && !existingBadges.includes(BADGES.LEVEL_5.id)) {
            newBadge = BADGES.LEVEL_5;
        }
        if (user.level >= 10 && !existingBadges.includes(BADGES.LEVEL_10.id)) {
            newBadge = BADGES.LEVEL_10;
        }
    }

    if (newBadge) {
        user.badges.push({
            id: newBadge.id,
            name: newBadge.name,
            icon: newBadge.icon,
            dateEarned: new Date()
        });
        await user.save();
        return newBadge;
    }
    return null;
};

module.exports = { addXP, checkBadges, LEVEL_THRESHOLDS, BADGES };
