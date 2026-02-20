const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);

        const faculty = users.filter(u => u.role === 'faculty');
        console.log(`Faculty Count: ${faculty.length}`);

        if (faculty.length > 0) {
            console.log('Faculty Members:');
            faculty.forEach(f => console.log(`- ${f.name} (${f.email}) [Role: ${f.role}]`));
        } else {
            console.log('No users with role "faculty" found.');
        }

        const students = users.filter(u => u.role === 'student');
        console.log(`Student Count: ${students.length}`);

        const admins = users.filter(u => u.role === 'admin');
        console.log(`Admin (User model) Count: ${admins.length}`);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

checkUsers();
