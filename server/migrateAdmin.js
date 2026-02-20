const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Admin = require('./models/Admin');
dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        // Find existing Admin in Users collection
        const oldAdmin = await User.findOne({ role: 'admin' });

        if (oldAdmin) {
            console.log(`Found old admin in Users collection: ${oldAdmin.email}`);

            // Check if already in Admin collection
            const existingNewAdmin = await Admin.findOne({ email: oldAdmin.email });

            if (!existingNewAdmin) {
                console.log('Migrating to Admin collection...');
                await Admin.create({
                    name: oldAdmin.name || 'Administrator',
                    email: oldAdmin.email,
                    password: oldAdmin.password, // Keep hashed password
                    role: 'admin'
                });
                console.log('Migration successful.');
            } else {
                console.log('Admin already exists in new collection.');
            }

            // Remove from Users collection to enforce separation
            await User.deleteOne({ _id: oldAdmin._id });
            console.log('Removed Admin from Users collection.');
        } else {
            console.log('No Admin found in Users collection.');
        }

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

migrate();
