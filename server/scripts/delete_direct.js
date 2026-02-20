const mongoose = require('mongoose');

// Hardcode URI from .env (to be filled in configured script)
const MONGO_URI = 'mongodb://127.0.0.1:27017/student_analyzer';

const deleteDirect = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const namesToDelete = ['Dr. Faculty', 'Prof. Lecturer'];

        // Count before
        const models = require('./models_stub'); // Stub defined below or inline schema

        // Define simple schema to avoid loading full app models if they have dependencies
        const UserSchema = new mongoose.Schema({ name: String, email: String, role: String }, { strict: false });
        const User = mongoose.model('User', UserSchema);

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

        const courses = await Course.find({ instructors: { $in: namesToDelete } });
        console.log(`Checking ${courses.length} courses for cleanup...`);

        for (const c of courses) {
            c.instructors = c.instructors.filter(i => !namesToDelete.includes(i));
            await c.save();
            console.log(`Cleaned course ${c.code}`);
        }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

deleteDirect();
