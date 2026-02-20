const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const fs = require('fs');

dotenv.config();

const log = (msg) => {
    console.log(msg);
    try { fs.appendFileSync('user_debug_result.txt', msg + '\n'); } catch (e) { }
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const id = '698d4eaf1056825380ff7baa';
        log(`Searching for User ID: ${id}`);

        const user = await User.findById(id);
        if (user) {
            log(`User FOUND: ${user.email} (${user.role})`);
        } else {
            log('User NOT FOUND in DB');
        }

        process.exit();
    } catch (e) {
        log(`Error: ${e.message}`);
        process.exit(1);
    }
};

run();
