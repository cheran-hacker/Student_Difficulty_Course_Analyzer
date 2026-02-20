const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function verifyPhase3() {
    console.log('--- Verifying Phase 3: Communication & Resources ---');

    let token;
    let facultyUser;
    let courseId; // Need a real course ID

    // 1. Login Logic (Reuse form prev)
    try {
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'adminpassword' // Adjust if needed
        });
        const adminToken = adminLogin.data.token;
        const usersRes = await axios.get(`${BASE_URL}/admin/students`, { headers: { Authorization: `Bearer ${adminToken}` } });
        facultyUser = usersRes.data.find(u => u.role === 'faculty');

        if (!facultyUser) throw new Error('No Faculty User');

        // Login as Faculty (Assuming known pass or just using what we can)
        // If we can't login easily in script, we might mock or skip.
        // Assuming 'password123' again strictly for dev env.
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: facultyUser.email,
            password: 'password123'
        });
        token = loginRes.data.token;
        console.log('✅ Faculty Logged In');

        // Get Courses
        const coursesRes = await axios.get(`${BASE_URL}/faculty/courses`, { headers: { Authorization: `Bearer ${token}` } });
        if (coursesRes.data.length === 0) throw new Error('No Courses Assigned to Faculty');
        courseId = coursesRes.data[0]._id;
        console.log(`✅ Using Course ID: ${courseId}`);

    } catch (err) {
        console.error('❌ Setup Failed:', err.message);
        return;
    }

    // 2. Test Announcements
    try {
        console.log('\n--- Testing Announcements ---');
        // Create
        const annPost = await axios.post(`${BASE_URL}/faculty/announcement`, {
            courseId,
            title: 'Test Announcement',
            content: 'This is a verified test.',
            priority: 'high'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('✅ Announcement Created:', annPost.data.title);

        // Fetch
        const annGet = await axios.get(`${BASE_URL}/faculty/course/${courseId}/announcements`, { headers: { Authorization: `Bearer ${token}` } });
        console.log(`✅ Fetched ${annGet.data.length} Announcements`);
        if (annGet.data[0].title !== 'Test Announcement') console.error('❌ Announcement Content Mismatch');

    } catch (err) {
        console.error('❌ Announcement Test Failed:', err.response?.data || err.message);
    }

    // 3. Test Resources
    try {
        console.log('\n--- Testing Resources ---');
        // Create
        const resPost = await axios.post(`${BASE_URL}/faculty/resource`, {
            courseId,
            title: 'Test Resource',
            description: 'Link to documentation',
            fileUrl: 'https://docs.google.com',
            fileType: 'link'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('✅ Resource Shared:', resPost.data.title);

        // Fetch
        const resGet = await axios.get(`${BASE_URL}/faculty/course/${courseId}/resources`, { headers: { Authorization: `Bearer ${token}` } });
        console.log(`✅ Fetched ${resGet.data.length} Resources`);

    } catch (err) {
        console.error('❌ Resource Test Failed:', err.response?.data || err.message);
    }
}

verifyPhase3();
