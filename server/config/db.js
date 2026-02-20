const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connString = process.env.MONGO_URI;
        if (!connString) {
            console.error('Error: MONGO_URI environment variable is not defined.');
            process.exit(1);
        }

        // Mask the password for logging
        const maskedConnString = connString.replace(/:([^:@]{1,})@/, ':****@');
        console.log(`Connecting to MongoDB with URI: ${maskedConnString}`);

        const conn = await mongoose.connect(connString);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
