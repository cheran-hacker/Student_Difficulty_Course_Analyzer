require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

async function checkCount() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Course.countDocuments();
    console.log(`Current Course Count: ${count}`);
    process.exit();
}

checkCount();
