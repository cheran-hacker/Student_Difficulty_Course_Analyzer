const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const allUsers = await User.find({});
        console.log(`Total Users: ${allUsers.length}`);

        const faculty = allUsers.filter(u => u.role === 'faculty');
        console.log(`Faculty (strict match): ${faculty.length}`);

        if (faculty.length === 0) {
            console.log('No faculty found with strict match.');
            // Check for potential mismatches
            const loosely = allUsers.filter(u => u.role && u.role.toLowerCase().trim() === 'faculty');
            console.log(`Faculty (loose match): ${loosely.length}`);

            if (loosely.length > 0) {
                console.log('Found faculty with inconsistent role formatting:');
                loosely.forEach(u => console.log(`- ${u.name}: '${u.role}'`));
            }
        } else {
            console.log('Faculty found:');
            faculty.forEach(f => console.log(`- ${f.name} (${f.email})`));
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

checkDb();
