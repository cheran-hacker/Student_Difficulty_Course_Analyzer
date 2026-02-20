const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
dotenv.config({ path: './server/.env' });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Course.countDocuments();
        console.log(`Total Courses in DB: ${count}`);

        const depts = await Course.distinct('department');
        console.log('Departments found:', depts);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
verify();
