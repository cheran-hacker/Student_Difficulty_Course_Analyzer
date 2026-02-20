require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

async function syncAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = process.env.ADMIN_EMAIL || 'cheran@it23';
        const password = process.env.ADMIN_PASSWORD || 'cheran@0308';
        const name = 'Admin User';

        let admin = await Admin.findOne({ email });

        if (admin) {
            console.log('Admin already exists, updating password...');
            admin.password = password; // pre-save hook will hash it
            await admin.save();
            console.log('Admin password updated successfully.');
        } else {
            console.log('Creating new admin...');
            await Admin.create({
                name,
                email,
                password,
                role: 'admin'
            });
            console.log('Admin created successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error syncing admin:', err);
        process.exit(1);
    }
}

syncAdmin();
