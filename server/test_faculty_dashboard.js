const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const testDashboard = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find a Faculty User
        const faculty = await User.findOne({ role: 'faculty' });
        if (!faculty) {
            console.log('No faculty user found.');
            process.exit(1);
        }
        console.log(`Found faculty: ${faculty.name} (${faculty.email})`);

        // 2. Reset Password to ensure we can login
        faculty.password = '123456';
        // Note: In a real app we'd hash it, but here we depend on pre-save hook? 
        // We need to save it such that pre-save hook runs.
        await faculty.save();
        console.log('Password reset to 123456');

        // 3. Login
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: faculty.email,
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('Logged in. Token received.');

        // 4. Get Dashboard
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const dashRes = await axios.get('http://localhost:5001/api/faculty/dashboard', config);
            console.log('Dashboard Data:', {
                courses: dashRes.data.courses.length,
                totalFeedbacks: dashRes.data.totalFeedbacks,
                avgRating: dashRes.data.avgRating
            });
            console.log('Assigned Courses:', dashRes.data.courses.map(c => c.code));
        } catch (e) {
            console.error('Dashboard Error:', e.response?.data || e.message);
        }

        // 5. Get At-Risk
        try {
            const riskRes = await axios.get('http://localhost:5001/api/faculty/at-risk', config);
            console.log('At-Risk Students:', riskRes.data.length);
        } catch (e) {
            console.error('At-Risk Error:', e.response?.data || e.message);
        }

        process.exit();

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
        process.exit(1);
    }
};

testDashboard();
