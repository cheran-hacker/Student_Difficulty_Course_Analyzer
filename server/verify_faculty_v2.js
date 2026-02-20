const axios = require('axios');
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

// Mock credentials (assuming admin can create/get faculty)
// For this test, we'll try to login as a faculty if one exists, or fail gracefully.
// NOTE: You need to have a faculty user in DB.

async function verifyFacultyFeatures() {
    console.log('--- Verifying Faculty v2.0 Features ---');

    // 1. Login as Faculty (Simulated)
    // We'll use the admin to find a faculty member first, or just assume one.
    // Actually, let's login as admin first to find a faculty email.
    let token;
    let facultyUser;

    try {
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'adminpassword'
        });
        const adminToken = adminLogin.data.token;

        const usersRes = await axios.get(`${BASE_URL}/admin/students`, { // access all users
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        facultyUser = usersRes.data.find(u => u.role === 'faculty');

        if (!facultyUser) {
            console.error('❌ No faculty user found. Please create one first.');
            return;
        }

        console.log(`✅ Found Faculty: ${facultyUser.name} (${facultyUser.email})`);

        // FORCE RESET password to known one for testing if needed, or just warn if we can't login.
        // For now, assuming we know the password or can't login. 
        // Let's try to login with a default password '123456' which is common in seeded data.

        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: facultyUser.email,
            password: 'password123' // Assuming this is the password
        });

        token = loginRes.data.token;
        console.log('✅ Faculty Logged In');

    } catch (err) {
        console.error('❌ Login failed (might need correct password or user creation):', err.message);
        // Fallback: If we can't login, we can't test API.
        // But we CAN test Socket connection effectively.
    }

    // 2. Test Socket.io (Live Pulse)
    console.log('\n--- Testing Live Pulse Socket ---');
    const socket = io(SOCKET_URL);
    const courseRoom = 'COURSE_123'; // Mock Room

    socket.on('connect', () => {
        console.log('✅ Socket Connected');
        socket.emit('join_room', courseRoom);

        // Listen for pulse
        socket.on('receive_pulse', (data) => {
            console.log(`✅ Received Pulse: ${data.type} in ${data.courseId}`);
            socket.disconnect();

            if (data.type === 'confused') {
                console.log('🎉 Live Pulse Verification PASSED');
            }
        });

        // Send pulse
        setTimeout(() => {
            console.log('Sending pulse...');
            socket.emit('send_pulse', { courseId: courseRoom, type: 'confused' });
        }, 500);
    });

    // 3. Test At-Risk API (if token available)
    if (token) {
        try {
            console.log('\n--- Testing At-Risk API ---');
            const atRiskRes = await axios.get(`${BASE_URL}/faculty/at-risk`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ At-Risk Students:', atRiskRes.data.length);
        } catch (err) {
            console.error('❌ At-Risk API Failed:', err.reponse?.data || err.message);
        }
    }
}

verifyFacultyFeatures();
