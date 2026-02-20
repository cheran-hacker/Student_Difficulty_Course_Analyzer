const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api/auth';

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get Admin Token
        // Assuming there is an admin in the DB or we create one temporarily
        // For this test, let's try to find an existing admin or create a temporary one
        let admin = await Admin.findOne();
        if (!admin) {
            console.log('No admin found, creating temp admin');
            admin = await Admin.create({
                name: 'Temp Admin',
                email: 'tempadmin@test.com',
                password: 'password123',
                role: 'admin'
            });
        }

        // Login as Admin to get token
        const adminLogin = await axios.post(`${API_URL}/login`, {
            email: admin.email,
            password: 'password123' // Assuming we know the password or just reset it? 
            // Better approach: generate token directly since we have DB access
        });

        // Wait, we can't easily login if we don't know the password.
        // Let's generate a token manually using the same secret
        const jwt = require('jsonwebtoken');
        const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('Generated Admin Token');

        // 2. Create a Test Student
        const testStudentEmail = `teststudent_${Date.now()}@bitsathy.ac.in`;
        const testStudent = await User.create({
            name: 'Test Student',
            email: testStudentEmail,
            password: 'oldpassword',
            role: 'student'
        });
        console.log(`Created Test Student: ${testStudent.email}`);

        // 3. Reset Password
        const newPassword = 'newpassword123';
        console.log(`Attempting to reset password to: ${newPassword}`);

        const resetRes = await axios.put(
            `${API_URL}/users/${testStudent._id}/reset-password`,
            { password: newPassword },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        if (resetRes.status === 200) {
            console.log('Reset Password Endpoint returned 200 OK');
        } else {
            console.error('Reset Password Failed:', resetRes.data);
            process.exit(1);
        }

        // 4. Verify Login with New Password
        try {
            const loginRes = await axios.post(`${API_URL}/login`, {
                email: testStudentEmail,
                password: newPassword
            });
            console.log('Login with new password successful!');
            console.log('Token received:', loginRes.data.token ? 'Yes' : 'No');
        } catch (loginErr) {
            console.error('Login with new password failed:', loginErr.response?.data || loginErr.message);
            process.exit(1);
        }

        // Cleanup
        await User.findByIdAndDelete(testStudent._id);
        if (admin.email === 'tempadmin@test.com') await Admin.findByIdAndDelete(admin._id);

        console.log('Verification Passed & Cleanup Done');
        process.exit(0);

    } catch (error) {
        console.error('Verification Error:', error.response?.data || error.message);
        process.exit(1);
    }
};

runVerification();
