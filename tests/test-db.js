const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './server/.env' });

async function run() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('student_analyzer');
        const counts = await db.collection('courses').aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
        console.log('DEPARTMENT COUNTS:');
        counts.forEach(c => console.log(`${c._id}: ${c.count}`));

        const firstCourse = await db.collection('courses').findOne({});
        console.log('SAMPLE COURSE:', JSON.stringify(firstCourse, null, 2));

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await client.close();
    }
}
run();
