require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Course.countDocuments();
        console.log('Total Courses:', count);

        const aggregation = await Course.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        console.log('Courses by Department:', aggregation);

        const statusAggregation = await Course.aggregate([
            { $group: { _id: '$uploadStatus', count: { $sum: 1 } } }
        ]);
        console.log('Courses by Status:', statusAggregation);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verify();
