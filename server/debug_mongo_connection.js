const mongoose = require('mongoose');
const uri = "mongodb://localhost:27017/student_analyzer";

console.log('Attempting to connect to:', uri);

const connect = async () => {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

connect();
