const mongoose = require('mongoose');
require('dotenv').config();

// Configuration
const LOCAL_URI = 'mongodb://127.0.0.1:27017/student_analyzer';
// We read the CLOUD URI from the .env file (which we just updated)
const CLOUD_URI = process.env.MONGO_URI;

const CourseSchema = new mongoose.Schema({}, { strict: false });

const migrate = async () => {
    if (!CLOUD_URI || CLOUD_URI.includes('127.0.0.1')) {
        console.error('Error: .env MONGO_URI seems to be local. Please set it to the Cloud URI.');
        process.exit(1);
    }

    let localConn, cloudConn;

    try {
        console.log('1. Connecting to Local DB...');
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('   Connected to Local DB.');

        console.log('2. Connecting to Cloud DB...');
        cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
        console.log('   Connected to Cloud DB.');

        const LocalCourse = localConn.model('Course', CourseSchema);
        const CloudCourse = cloudConn.model('Course', CourseSchema);

        console.log('3. Fetching courses from Local DB...');
        const localCourses = await LocalCourse.find({});
        console.log(`   Found ${localCourses.length} courses locally.`);

        if (localCourses.length === 0) {
            console.log('   No courses found to migrate.');
            process.exit(0);
        }

        console.log('4. Clearing existing courses in Cloud DB (to avoid duplicates)...');
        await CloudCourse.deleteMany({});
        console.log('   Cloud DB courses cleared.');

        console.log('5. Uploading courses to Cloud DB...');
        // Remove _id to avoid conflicts if IDs are different or valid, but usually keep them is fine.
        // However, let's keep them to ensure references work if any.
        await CloudCourse.insertMany(localCourses);

        console.log(`\nSUCCESS! Migrated ${localCourses.length} courses to Cloud DB.`);

    } catch (error) {
        console.error('Migration Failed:', error);
    } finally {
        if (localConn) localConn.close();
        if (cloudConn) cloudConn.close();
        process.exit(0);
    }
};

migrate();
