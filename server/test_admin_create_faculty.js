const fetch = require('node-fetch');

const createFaculty = async () => {
    try {
        // 1. Login as Admin
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@bitsathy.ac.in', password: 'admin' })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);

        const token = loginData.token;

        // 2. Create Faculty
        const newFaculty = {
            name: "Dr. New Faculty",
            email: "new.faculty@bitsathy.ac.in",
            password: "password123",
            role: "faculty",
            department: "CSE"
            // Note: No studentId provided
        };

        const createRes = await fetch('http://localhost:5001/api/auth/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newFaculty)
        });

        const createData = await createRes.json();
        console.log(`Create Status: ${createRes.status}`);
        console.log('Response:', JSON.stringify(createData, null, 2));

    } catch (error) {
        console.error('Test Failed:', error);
    }
};

createFaculty();
