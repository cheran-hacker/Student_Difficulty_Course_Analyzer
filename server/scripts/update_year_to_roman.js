const mongoose = require('mongoose');

// Hardcode URI from .env
const MONGO_URI = 'mongodb://127.0.0.1:27017/student_analyzer';

const updateYear = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // Define simple schema to access `year` field flexibly
        const UserSchema = new mongoose.Schema({
            name: String,
            year: mongoose.Schema.Types.Mixed,
            role: String
        }, { strict: false });

        // Use existing model if loaded, or create new one
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students.`);

        let updatedCount = 0;

        for (const student of students) {
            let originalYear = student.year;
            let newYear = originalYear;

            // simple normalization
            const val = String(originalYear).trim();

            if (val === '1' || val === '1st' || val === 'First' || val === 'Freshman') newYear = 'I';
            else if (val === '2' || val === '2nd' || val === 'Second' || val === 'Sophomore') newYear = 'II';
            else if (val === '3' || val === '3rd' || val === 'Third' || val === 'Junior') newYear = 'III';
            else if (val === '4' || val === '4th' || val === 'Fourth' || val === 'Senior') newYear = 'IV';

            if (newYear !== originalYear) {
                // Must ensure we are writing a string back
                student.year = newYear;
                // Using .updateOne to avoid validation errors from other strict fields in full model if present
                await User.updateOne({ _id: student._id }, { $set: { year: newYear } });
                console.log(`Updated ${student.name}: ${originalYear} -> ${newYear}`);
                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} students.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updateYear();
