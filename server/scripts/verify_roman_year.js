const mongoose = require('mongoose');

// Hardcode URI from .env
const MONGO_URI = 'mongodb://127.0.0.1:27017/student_analyzer';

const verifyRoman = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const UserSchema = new mongoose.Schema({ name: String, year: String, role: String }, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const students = await User.find({ role: 'student' }).limit(10);
        console.log('Sample Student Years:', students.map(s => ({ name: s.name, year: s.year })));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyRoman();
