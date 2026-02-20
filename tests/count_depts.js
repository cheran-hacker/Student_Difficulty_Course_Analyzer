const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: './server/.env' });

const Course = require('./server/models/Course');

async function checkDepts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const counts = await Course.aggregate([
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        let output = "DEPARTMENT COUNTS:\n";
        counts.forEach(c => {
            output += `${c._id}: ${c.count}\n`;
        });

        fs.writeFileSync('dept_counts.txt', output);
        console.log('Results written to dept_counts.txt');
        process.exit();
    } catch (err) {
        fs.writeFileSync('dept_counts.txt', 'ERROR: ' + err.message);
        process.exit(1);
    }
}

checkDepts();
