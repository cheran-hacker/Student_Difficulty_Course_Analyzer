const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const API_URL = 'http://localhost:5001/api';
const ADMIN_EMAIL = 'cheran@123'; // Using admin to get a student or create one
const PASSWORD = 'cheran';

// Colors for console
const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

async function runTest() {
    try {
        console.log('--- Student Course CRUD Verification ---');

        // 1. Login as Admin to finding a student/course
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log(`${green}✔ Logged in${reset}`);

        // 2. Get a Course to Enroll in
        console.log('2. Fetching courses...');
        const coursesRes = await axios.get(`${API_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const course = coursesRes.data.courses[0]; // Pick first course
        if (!course) throw new Error('No courses found to test with');
        console.log(`${green}✔ Found course: ${course.code}${reset}`);

        // 3. User Self-Enroll (Simulating Student Action)
        // Note: Admin is also a "user", so we can test enrollment on the admin account for simplicity
        // or we need a real student token. Let's use the current token (Admin/User).

        console.log(`3. Attempting to ENROLL in ${course.code}...`);
        try {
            const enrollRes = await axios.post(`${API_URL}/student/enroll`, {
                courseId: course._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`${green}✔ Enrollment Success: ${enrollRes.data.message}${reset}`);
        } catch (e) {
            if (e.response && e.response.data.message === 'Already enrolled in this course') {
                console.log(`${green}✔ Already enrolled (Expected if repeated)${reset}`);
            } else {
                throw e;
            }
        }

        // 4. User Drop Course
        console.log(`4. Attempting to DROP ${course.code}...`);
        const dropRes = await axios.post(`${API_URL}/student/drop`, {
            courseId: course._id
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${green}✔ Drop Success: ${dropRes.data.message}${reset}`);

        console.log('\n--- VERIFICATION COMPLETE: ALL CHECKS PASSED ---');

    } catch (error) {
        console.error(`${red}✘ TEST FAILED:${reset}`, error.response ? error.response.data : error.message);
    }
}

runTest();
