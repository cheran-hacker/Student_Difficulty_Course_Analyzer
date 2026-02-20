const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'student' }).lean();
        console.log(`Found ${users.length} students.`);

        let corruptedUsers = 0;
        for (const user of users) {
            const invalidCourses = user.courses.filter(c => !mongoose.Types.ObjectId.isValid(c));
            if (invalidCourses.length > 0) {
                console.log(`User ${user.name} (${user.email}) has invalid courses:`, invalidCourses);
                corruptedUsers++;
            }
        }

        console.log(`Total corrupted users: ${corruptedUsers}`);

        const courses = await Course.find({});
        console.log('Available Courses:', courses.map(c => ({ id: c._id, code: c.code, name: c.name })));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkData();
