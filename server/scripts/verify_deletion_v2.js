const mongoose = require('mongoose');

// Hardcode URI from .env
const MONGO_URI = 'mongodb://127.0.0.1:27017/student_analyzer';

const verifyDeletion = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        const namesToCheck = ['Dr. Faculty', 'Prof. Lecturer'];

        // Check Users
        // Need to use existing model name if already registered in previous require, OR define new one if fresh process
        // Since we are running in a fresh process node instance, we can define schemas safely

        const UserSchema = new mongoose.Schema({ name: String }, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const foundUsers = await User.find({ name: { $in: namesToCheck } });
        console.log(`Remaining users with these names: ${foundUsers.length}`);
        if (foundUsers.length > 0) console.log(foundUsers.map(u => u.name));

        // Check Courses
        const CourseSchema = new mongoose.Schema({ instructors: [String], code: String }, { strict: false });
        const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

        const foundCourses = await Course.find({ instructors: { $in: namesToCheck } });
        console.log(`Remaining courses with these instructors: ${foundCourses.length}`);
        if (foundCourses.length > 0) console.log(foundCourses.map(c => c.code));

        console.log('Verification Complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

verifyDeletion();
