const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const userId = '698d4eaf1056825380ff7baa'; // The one from the error
const adminToken = process.env.TEMP_ADMIN_TOKEN || ''; // We might need a token if it's protected.

// The route is protected by `protect` and `admin`.
// We need to login as admin first to get a token.

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Check/Create Subject User
        let user = await User.findById(userId);
        if (!user) {
            console.log(`User ${userId} not found. Creating dummy user...`);
            try {
                user = await User.create({
                    _id: userId,
                    name: 'Test Student',
                    email: 'test_reset@bitsathy.ac.in',
                    password: 'password123',
                    role: 'student',
                    department: 'IT',
                    year: 1
                });
                console.log('Dummy user created.');
            } catch (e) {
                console.log('Could not create dummy user with specific ID (maybe format issue?), creating new one...');
                user = await User.create({
                    name: 'Test Student',
                    email: 'test_reset_new@bitsathy.ac.in',
                    password: 'password123',
                    role: 'student',
                    department: 'IT',
                    year: 1
                });
                console.log(`Created new dummy user: ${user._id}`);
            }
        } else {
            console.log(`User ${userId} exists.`);
        }

        const targetId = user._id.toString();

        // 2. Login as Admin to get Token
        // We know admin creds from .env (usually) or we can create an admin
        // .env has ADMIN_EMAIL=cheran@it23

        console.log('Logging in as Admin...');
        const loginData = JSON.stringify({
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            password: process.env.ADMIN_PASSWORD || 'admin123'
        });

        const loginReq = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.error('Admin Login Failed:', res.statusCode, data);
                    process.exit(1);
                }
                const token = JSON.parse(data).token;
                console.log('Admin Token received.');

                // 3. Perform Password Reset
                const resetData = JSON.stringify({ password: 'newpassword123' });
                const resetReq = http.request({
                    hostname: 'localhost',
                    port: 5000,
                    path: `/api/auth/users/${targetId}/reset-password`,
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': resetData.length,
                        'Authorization': `Bearer ${token}`
                    }
                }, (rRes) => {
                    let rData = '';
                    rRes.on('data', chunk => rData += chunk);
                    rRes.on('end', () => {
                        console.log('Reset Password Status:', rRes.statusCode);
                        console.log('Reset Password Body:', rData);
                        mongoose.disconnect();
                    });
                });
                resetReq.write(resetData);
                resetReq.end();
            });
        });

        loginReq.write(loginData);
        loginReq.end();

    } catch (e) {
        console.error(e);
        mongoose.disconnect();
    }
}

run();
