const mongoose = require('mongoose');
const fs = require('fs');

const run = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/student_analyzer');
        fs.writeFileSync('verification_result.txt', 'MONGO_SUCCESS');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        fs.writeFileSync('verification_result.txt', 'MONGO_FAILED: ' + error.message);
        process.exit(1);
    }
};

run();
