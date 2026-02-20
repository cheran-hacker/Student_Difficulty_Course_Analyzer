const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Login as Faculty
        console.log('\n--- 1. Testing Faculty Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'faculty@bitsathy.ac.in', // Ensure this user exists from previous seeds
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login Successful. Token received.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Fetch Dashboard Stats (Gamification)
        console.log('\n--- 2. Testing Dashboard Stats (Gamification) ---');
        const dashboardRes = await axios.get(`${API_URL}/faculty/dashboard`, config);
        const stats = dashboardRes.data;

        if (stats.gamification) {
            console.log('Gamification Stats received:', stats.gamification);
        } else {
            console.error('FAILED: Gamification stats missing in dashboard response.');
        }

        // 3. Test At-Risk Endpoint
        console.log('\n--- 3. Testing At-Risk Students Endpoint ---');
        const atRiskRes = await axios.get(`${API_URL}/faculty/at-risk`, config);
        console.log(`At-Risk Students Found: ${atRiskRes.data.length}`);

        console.log('\n--- Phase 4 Verification Complete: Backend seems healthy ---');

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
};

runVerification();
