const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

async function diagnostic() {
    console.log(`Starting diagnostics on ${BASE_URL}...`);

    try {
        const ping = await axios.get(`${BASE_URL}/ping`);
        console.log(`[OK] Ping: ${ping.data}`);
    } catch (e) {
        console.error(`[FAIL] Ping failed: ${e.message}`);
        if (e.code === 'ECONNREFUSED') {
            console.error(`Port ${PORT} is closed. Is the server running?`);
        }
    }

    try {
        const routes = await axios.get(`${BASE_URL}/debug-routes`);
        console.log(`[OK] Debug Routes: ${routes.data.total} routes found.`);
    } catch (e) {
        console.error(`[FAIL] Debug routes failed: ${e.message}`);
    }

    // Try a dummy login
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: 'nonexistent@bitsathy.ac.in',
            password: 'password'
        });
    } catch (e) {
        console.log(`[INFO] Dummy login returned: ${e.response?.status} ${e.response?.data?.message}`);
        if (e.response?.status === 500) {
            console.error(`[CRITICAL] Login returned 500!`);
            console.error(JSON.stringify(e.response.data, null, 2));
        }
    }
}

diagnostic();
