const Feedback = require('../models/Feedback');
const Course = require('../models/Course');

const aggregateCourseData = async (courseId) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error('Course not found');
    }

    const stats = await Feedback.aggregate([
        { $match: { course: course._id } },
        {
            $group: {
                _id: '$course',
                totalFeedback: { $sum: 1 },
                avgDifficulty: { $avg: '$difficultyIndex' },
                avgSentiment: { $avg: '$sentimentScore' },
                avgTime: { $avg: '$timeCommitment' },
                avgSyllabus: { $avg: '$ratings.syllabus' },
                avgMethodology: { $avg: '$ratings.methodology' },
                avgWorkload: { $avg: '$ratings.workload' },
                avgAssessment: { $avg: '$ratings.assessment' },
                avgResources: { $avg: '$ratings.resources' }
            }
        }
    ]);

    // Fetch recent feedbacks separately (pagination)
    const recentFeedbacks = await Feedback.find({ course: courseId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name studentId');

    const result = stats[0] || {
        totalFeedback: 0,
        avgDifficulty: 0,
        avgSentiment: 0,
        avgTime: 0,
        avgSyllabus: 0,
        avgMethodology: 0,
        avgWorkload: 0,
        avgAssessment: 0,
        avgResources: 0
    };

    return {
        name: course.name,
        code: course.code,
        department: course.department,
        semester: course.semester,
        instructors: course.instructors,
        totalFeedback: result.totalFeedback,
        difficultyIndex: result.avgDifficulty.toFixed(2),
        sentimentScore: result.avgSentiment.toFixed(2),
        avgTimeCommitment: result.avgTime.toFixed(1),
        ratings: {
            syllabus: result.avgSyllabus,
            methodology: result.avgMethodology,
            workload: result.avgWorkload,
            assessment: result.avgAssessment,
            resources: result.avgResources,
        },
        feedbacks: recentFeedbacks.map(f => ({
            _id: f._id,
            user: f.user,
            difficultyIndex: f.difficultyIndex,
            timeCommitment: f.timeCommitment,
            sentimentScore: f.sentimentScore,
            createdAt: f.createdAt,
            comments: f.comments,
            // Calculate and add aggregated rating
            rating: f.ratings ?
                (Object.values(f.ratings).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0) /
                    Object.values(f.ratings).filter(v => typeof v === 'number').length).toFixed(1) : 'N/A'
        }))
    };
};

module.exports = { aggregateCourseData };

const getWorkloadForecast = async (courseId) => {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    // 1. Calculate baselines from syllabus data
    const topicCount = course.syllabus?.topicCount || 10;
    const baseWorkload = course.syllabus?.weeklyWorkload?.length > 0
        ? course.syllabus.weeklyWorkload
        : Array(16).fill(0).map(() => Math.floor(Math.random() * 5) + 3); // Fallback: 3-8 hours/week

    // 2. Adjust based on historical feedback (if available)
    const feedbacks = await Feedback.find({ course: courseId });
    let historicalMultiplier = 1.0;

    if (feedbacks.length > 0) {
        const avgTime = feedbacks.reduce((sum, f) => sum + f.timeCommitment, 0) / feedbacks.length;
        // If students report higher time than syllabus baseline (assuming 5h avg), scale up
        historicalMultiplier = avgTime / 5.0;
    }

    // 3. Generate Week-by-Week Forecast
    const forecast = baseWorkload.map((hours, index) => {
        const weekNum = index + 1;
        let intensity = 'Normal';
        let adjustedHours = hours * historicalMultiplier;

        // Apply "Midterm/Finals" spikes
        if (weekNum === 8 || weekNum === 16) {
            adjustedHours *= 1.5;
            intensity = 'Heavy';
        } else if (weekNum === 1) {
            adjustedHours *= 0.5;
            intensity = 'Light';
        }

        return {
            week: weekNum,
            hours: Math.round(adjustedHours),
            intensity,
            description: intensity === 'Heavy' ? 'Exam Period' : (intensity === 'Light' ? 'Intro Week' : 'Standard Lecture')
        };
    });

    return forecast;
};

const getPersonalDifficultyScore = async (studentId, courseId) => {
    const course = await Course.findById(courseId);
    const user = await require('../models/User').findById(studentId); // Lazy load User to avoid circular dependency

    if (!course) throw new Error('Course not found');

    // Graceful handling for non-student users (Admins/Faculty without student record)
    if (!user) {
        return {
            score: "N/A",
            baseline: "5.0",
            factor: "N/A",
            rationale: "Personalized prediction is only available for students."
        };
    }

    // 1. Get Course Baseline Difficulty (Admin/Syllabus based or Aggregated)
    // For now, derive from feedback or generate a static score
    const feedbacks = await Feedback.find({ course: courseId });
    const courseDifficulty = feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.difficultyIndex, 0) / feedbacks.length
        : 5.0; // Default out of 10

    // 2. Adjust based on Student Profile (GPA/Academic Performance)
    let adjustment = 0;

    // GPA Factor: Higher GPA -> Lower perceived difficulty
    if (user.gpa > 0) {
        if (user.gpa >= 3.8) adjustment -= 2.0;
        else if (user.gpa >= 3.5) adjustment -= 1.0;
        else if (user.gpa < 2.5) adjustment += 1.5;
    } else {
        // Fallback to text status if GPA not set
        switch (user.academicPerformance) {
            case 'Excellent': adjustment -= 2.0; break;
            case 'Good': adjustment -= 1.0; break;
            case 'Poor': adjustment += 2.0; break;
        }
    }

    // 3. Calculate Final Score (Clamped 1-10)
    let personalScore = courseDifficulty + adjustment;
    personalScore = Math.max(1, Math.min(10, personalScore));

    return {
        score: personalScore.toFixed(1),
        baseline: courseDifficulty.toFixed(1),
        factor: adjustment <= -1 ? 'Easy for you' : (adjustment >= 1 ? 'Challenging' : 'Standard'),
        rationale: adjustment <= -1
            ? "Your strong academic record suggests you'll handle this well."
            : (adjustment >= 1
                ? "This course is tougher than your usual average."
                : "Matches your current skill level.")
    };
};

module.exports = { aggregateCourseData, getWorkloadForecast, getPersonalDifficultyScore };
