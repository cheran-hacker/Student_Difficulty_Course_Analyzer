const User = require('../models/User');

/**
 * Predicts student dropout probability based on engagement metrics.
 * Uses a heuristic model considering streak, XP, and login frequency.
 * @param {ObjectId} studentId 
 * @returns {Object} { probability, riskLevel, factors }
 */
const predictDropoutProbability = async (studentId) => {
    const student = await User.findById(studentId);
    if (!student) return null;

    let probability = 0;
    const factors = [];

    // Factor 1: Engagement Streak
    const streak = student.streak?.current || 0;
    if (streak === 0) {
        probability += 0.4; // High impact
        factors.push('Zero active streak');
    } else if (streak < 3) {
        probability += 0.1;
        factors.push('Low engagement consistency');
    }

    // Factor 2: XP Level (vs Average)
    const xp = student.xp || 0;
    if (xp < 100) {
        probability += 0.3;
        factors.push('Critically low XP progression');
    } else if (xp < 500) {
        probability += 0.1;
    }

    // Factor 3: Last Login
    if (student.streak?.lastLogin) {
        const lastLogin = new Date(student.streak.lastLogin);
        const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 3600 * 24);

        if (daysSinceLogin > 7) {
            probability += 0.2;
            factors.push(`Inactive for ${Math.floor(daysSinceLogin)} days`);
        }
    } else {
        probability += 0.2;
        factors.push('Unknown last login');
    }

    // Normalize Probability (0-1)
    probability = Math.min(Math.max(probability, 0), 0.95);

    let riskLevel = 'Low';
    if (probability > 0.7) riskLevel = 'Critical';
    else if (probability > 0.4) riskLevel = 'High';
    else if (probability > 0.2) riskLevel = 'Moderate';

    return {
        studentId,
        name: student.name,
        probability: parseFloat(probability.toFixed(2)),
        riskLevel,
        factors
    };
};

/**
 * Analyzes a specific course for overall dropout risk trends.
 * @param {ObjectId} courseId 
 */
const getCourseRiskAnalysis = async (courseId) => {
    const students = await User.find({ courses: courseId, role: 'student' });

    if (students.length === 0) return { riskDistribution: {}, highRiskStudents: [] };

    const predictions = await Promise.all(students.map(s => predictDropoutProbability(s._id)));

    // Aggregate
    const highRisk = predictions.filter(p => p.probability > 0.6);
    const moderateRisk = predictions.filter(p => p.probability > 0.3 && p.probability <= 0.6);
    const lowRisk = predictions.filter(p => p.probability <= 0.3);

    return {
        totalStudents: students.length,
        riskDistribution: {
            critical: highRisk.length,
            moderate: moderateRisk.length,
            low: lowRisk.length
        },
        highRiskStudents: highRisk.sort((a, b) => b.probability - a.probability).slice(0, 5) // Top 5
    };
};

module.exports = {
    predictDropoutProbability,
    getCourseRiskAnalysis
};
