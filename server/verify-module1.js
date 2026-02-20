const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Course = require('./models/Course');
const User = require('./models/User');
const { getWorkloadForecast, getPersonalDifficultyScore } = require('./services/analyticsService');

dotenv.config();

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`.cyan.underline);

        // 1. Get a Course
        const course = await Course.findOne();
        if (!course) throw new Error("No courses found. Run seeder first.");
        console.log(`Testing with Course: ${course.code} - ${course.name}`.yellow);

        // 2. Get a User
        const user = await User.findOne({ role: 'student' });
        if (!user) throw new Error("No students found.");
        console.log(`Testing with Student: ${user.name} (GPA: ${user.gpa || 'N/A'})`.yellow);

        // 3. Test Workload Forecast
        console.log(`\n--- Workload Forecast ---`.cyan);
        const forecast = await getWorkloadForecast(course._id);
        console.log(`Forecast generated for ${forecast.length} weeks.`);
        console.log(`Sample (Week 1):`, forecast[0]);
        console.log(`Sample (Week 8):`, forecast[7]);

        // 4. Test Personal Difficulty
        console.log(`\n--- Personal Difficulty ---`.cyan);
        const difficulty = await getPersonalDifficultyScore(user._id, course._id);
        console.log(`Score: ${difficulty.score}/10`);
        console.log(`Factor: ${difficulty.factor}`);
        console.log(`Rationale: ${difficulty.rationale}`);

        console.log(`\n✅ MODULE 1 VERIFICATION PASSED`.green.bold);
        process.exit();
    } catch (error) {
        console.error(`❌ VERIFICATION FAILED: ${error.message}`.red.bold);
        process.exit(1);
    }
};

runVerification();
