const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Feedback = require('./models/Feedback');
const { faculty } = require('./middleware/authMiddleware');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Create a Test Faculty
        const facultyEmail = 'faculty_test@bitsathy.ac.in';
        await User.deleteOne({ email: facultyEmail });

        const testFaculty = await User.create({
            name: 'Test Faculty',
            email: facultyEmail,
            password: 'password123',
            role: 'faculty',
            department: 'CSE'
        });
        console.log('1. Test Faculty Created:', testFaculty.email);

        // 2. Create a Test Course assigned to this faculty
        const courseCode = 'TEST101';
        await Course.deleteOne({ code: courseCode });

        const testCourse = await Course.create({
            code: courseCode,
            name: 'Test Course 101',
            department: 'CSE',
            semester: '5',
            instructors: [facultyEmail]
        });
        console.log('2. Test Course Created:', testCourse.code);

        // 3. Create Student Feedback for this course
        const student = await User.findOne({ role: 'student' });
        if (student) {
            await Feedback.create({
                course: testCourse._id,
                user: student._id,
                ratings: { syllabus: 5, methodology: 4, workload: 3, assessment: 4, resources: 5 },
                timeCommitment: 5,
                comments: 'Great course, learned a lot.',
                sentimentScore: 0.8
            });
            console.log('3. Student Feedback Created');
        } else {
            console.log('3. Skipped Student Feedback (No student found)');
        }

        // 4. Simulate Faculty Dashboard Logic (Manual Check matches Controller Logic)
        const courses = await Course.find({ instructors: { $in: [facultyEmail] } });
        console.log('4. Dashboard Courses Found:', courses.length);

        if (courses.length > 0) {
            const feedbacks = await Feedback.find({ course: courses[0]._id });
            console.log('5. Feedbacks for Course:', feedbacks.length);
        }

        console.log('Verification Complete. Cleanup...');
        await User.deleteOne({ email: facultyEmail });
        await Course.deleteOne({ code: courseCode });
        // Keeping feedback for now or cascading delete would handle it if set up, mostly manual cleanup needed if strictly required.

        console.log('Done.');
        process.exit();
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

runTest();
