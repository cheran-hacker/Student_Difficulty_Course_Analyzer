const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

const loginAndFetchFaculty = async () => {
    try {
        // 1. Login as Admin
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@bitsathy.ac.in', password: 'admin' })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);

        console.log('Admin Logged In. Token received.');
        const token = loginData.token;

        // 2. Fetch Faculty
        const facultyRes = await fetch('http://localhost:5001/api/auth/users?role=faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const facultyData = await facultyRes.json();
        console.log(`Fetch Status: ${facultyRes.status}`);
        console.log('Faculty Data:', JSON.stringify(facultyData, null, 2));

    } catch (error) {
        console.error('Test Failed:', error);
    }
};

loginAndFetchFaculty();
