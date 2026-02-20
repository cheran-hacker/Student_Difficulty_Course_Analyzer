const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Feedback = require('./models/Feedback');

dotenv.config();

const commentsList = [
    "Great course, learned a lot!",
    "Challenging but rewarding.",
    "The professor explained concepts clearly.",
    "Too much workload for 3 credits.",
    "Labs were fun, but exams were hard.",
    "Best course in the semester.",
    "Need more practical examples.",
    "Textbook was useless, but slides were good.",
    "Assignments were very tricky.",
    "Loved the project component."
];

const seedFeedback = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        // Clear existing feedback to avoid duplicates during dev
        await Feedback.deleteMany({});
        console.log('Cleared existing feedback...');

        const students = await User.find({ role: 'student' });
        const courses = await Course.find({});

        if (students.length === 0 || courses.length === 0) {
            console.log('No students or courses found. Seed them first.');
            process.exit(1);
        }

        const feedbacks = [];

        // Generate 5-10 feedback entries per course
        for (const course of courses) {
            const feedbackCount = Math.floor(Math.random() * 6) + 3; // 3 to 8 reviews per course

            // Shuffle students to pick random reviewers
            const shuffledStudents = students.sort(() => 0.5 - Math.random()).slice(0, feedbackCount);

            for (const student of shuffledStudents) {
                feedbacks.push({
                    user: student._id,
                    course: course._id,
                    ratings: {
                        syllabus: Math.floor(Math.random() * 5) + 6, // 6-10
                        methodology: Math.floor(Math.random() * 5) + 6,
                        workload: Math.floor(Math.random() * 5) + 5,
                        assessment: Math.floor(Math.random() * 5) + 5,
                        resources: Math.floor(Math.random() * 5) + 6
                    },
                    difficultyIndex: (Math.random() * 4 + 1).toFixed(1), // 1.0 to 5.0
                    timeCommitment: Math.floor(Math.random() * 15) + 5, // 5-20 hrs
                    sentimentScore: (Math.random() * 2 - 1).toFixed(2), // -1 to 1
                    comments: commentsList[Math.floor(Math.random() * commentsList.length)]
                });
            }
        }

        await Feedback.insertMany(feedbacks);
        console.log(`Successfully seeded ${feedbacks.length} feedback entries.`);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedFeedback();
