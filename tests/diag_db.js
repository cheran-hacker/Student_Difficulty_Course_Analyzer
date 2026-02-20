const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const testConn = async () => {
    console.log('Testing connection to:', process.env.MONGO_URI);
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('CONNECTED TO:', conn.connection.host);
        const depts = await mongoose.connection.db.collection('courses').distinct('department');
        console.log('EXISTING_DEPTS:', depts);
        process.exit(0);
    } catch (err) {
        console.error('CONN_ERROR:', err.message);
        process.exit(1);
    }
};

testConn();
