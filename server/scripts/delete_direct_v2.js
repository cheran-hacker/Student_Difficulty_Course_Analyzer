const mongoose = require('mongoose');

console.log('Script started.');

// Hardcode URI from .env
const MONGO_URI = 'mongodb://127.0.0.1:27017/student_analyzer';

const deleteDirect = async () => {
    try {
        console.log('Connecting to MongoDB at:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        const namesToDelete = ['Dr. Faculty', 'Prof. Lecturer'];

        // Define simple schema inline
        const UserSchema = new mongoose.Schema({ name: String, email: String, role: String }, { strict: false });
        const User = mongoose.model('User', UserSchema);

        console.log('Searching for users to delete:', namesToDelete);
        const users = await User.find({ name: { $in: namesToDelete } });
        console.log(`Found ${users.length} users to delete:`, users.map(u => u.name));

        if (users.length > 0) {
            const res = await User.deleteMany({ name: { $in: namesToDelete } });
            console.log(`Deleted ${res.deletedCount} users.`);
        } else {
            console.log('No users found with those names.');
        }

        // Check courses for cleanup
        const CourseSchema = new mongoose.Schema({ instructors: [String], code: String }, { strict: false });
        const Course = mongoose.model('Course', CourseSchema);

        console.log('Checking courses for cleanup...');
        const courses = await Course.find({ instructors: { $in: namesToDelete } });
        console.log(`Found ${courses.length} courses with sample instructor names.`);

        for (const c of courses) {
            c.instructors = c.instructors.filter(i => !namesToDelete.includes(i));
            await c.save();
            console.log(`Cleaned course ${c.code}`);
        }

        console.log('Done. Exiting.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

deleteDirect();
