const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const deleteViaApi = async () => {
    try {
        console.log('Starting deleteViaApi...');

        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'cheran@123',
            password: 'cheran'
        });
        const { token } = loginRes.data;
        console.log('Login successful.');

        // 2. Fetch Users
        console.log('Fetching users...');
        const usersRes = await axios.get(`${API_URL}/auth/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const users = usersRes.data;
        console.log(`Fetched ${users.length} users.`);

        // 3. Find Sample Users
        const namesToDelete = ['Dr. Faculty', 'Prof. Lecturer'];
        const targets = users.filter(u => namesToDelete.includes(u.name));
        console.log(`Found ${targets.length} users to delete:`, targets.map(t => t.name));

        // 4. Delete
        for (const user of targets) {
            console.log(`Deleting user: ${user.name} (${user._id})...`);
            await axios.delete(`${API_URL}/auth/users/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Deleted ${user.name}.`);
        }

        console.log('Done.');

    } catch (error) {
        console.error('Operation failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

deleteViaApi();
