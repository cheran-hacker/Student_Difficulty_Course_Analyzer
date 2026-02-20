const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5001/api'; // Port 5001
const ADMIN_EMAIL = 'cheran@123';
const PASSWORD = 'cheran';

// Colors
const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

async function runDebug() {
    try {
        console.log('--- Debugging Student Dashboard 500 Error ---');

        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log(`${green}✔ Logged in${reset}`);

        // 2. Test /api/student/dashboard
        console.log('2. GET /api/student/dashboard...');
        try {
            const dashRes = await axios.get(`${API_URL}/student/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`${green}✔ Dashboard Success${reset}`, dashRes.data ? 'Data received' : 'No data');
        } catch (e) {
            console.error(`${red}✘ Dashboard Failed:${reset}`, e.response ? e.response.data : e.message);
            if (e.response && e.response.status === 500) {
                console.log('Reproduced 500 Internal Server Error');
            }
        }

        // 3. Test /api/courses (Public/Protected?)
        console.log('3. GET /api/courses...');
        try {
            const coursesRes = await axios.get(`${API_URL}/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`${green}✔ Courses Success${reset}`, coursesRes.data.courses?.length + ' courses found');
        } catch (e) {
            console.error(`${red}✘ Courses Failed:${reset}`, e.response ? e.response.data : e.message);
        }

    } catch (error) {
        console.error(`${red}✘ TEST FAILED:${reset}`, error.message);
    }
}

runDebug();
