const Admin = require('../models/Admin');

const syncAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.log('Admin credentials not set in .env. Skipping sync.');
            return;
        }

        const user = await Admin.findOne({ email });

        if (!user) {
            console.log('[Startup] Creating Admin User in ADMINS collection...');
            await Admin.create({
                name: 'Administrator',
                email,
                password,
                role: 'admin'
            });
            console.log('[Startup] Admin created successfully in ADMINS collection.');
        } else {
            console.log('[Startup] Admin found in ADMINS collection. Syncing...');
            user.password = password;
            user.name = 'Administrator';
            await user.save();
            console.log('[Startup] Admin credentials synced.');
        }

    } catch (error) {
        console.error('[Startup] Error syncing admin:', error);
    }
};

module.exports = syncAdmin;
