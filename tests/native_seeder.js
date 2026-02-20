const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './server/.env' });

async function run() {
    console.log('Starting Native Nuclear Seeding...');
    const client = new MongoClient(process.env.MONGO_URI, { connectTimeoutMS: 5000 });
    try {
        await client.connect();
        console.log('Connected to DB');
        const db = client.db(); // Uses the DB from the URI or default
        const collection = db.collection('courses');

        console.log('Purging courses...');
        await collection.deleteMany({});
        console.log('Courses purged.');

        const coreDepts = ['CSE', 'IT', 'ECE'];
        const courses = [];

        coreDepts.forEach((dept, dIdx) => {
            for (let i = 1; i <= 5; i++) {
                courses.push({
                    code: `${dept}-${100 + i}-${dIdx}`,
                    name: `${dept} Specialty Module ${i}`,
                    department: dept,
                    semester: '1',
                    description: `Advanced study for ${dept} students.`,
                    instructors: ['Dr. System'],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        });

        console.log(`Inserting ${courses.length} courses...`);
        const result = await collection.insertMany(courses);
        console.log(`Success! Inserted ${result.insertedCount} courses.`);

    } catch (e) {
        console.error('NATIVE_SEED_ERROR:', e.message);
    } finally {
        await client.close();
        process.exit();
    }
}

run();
