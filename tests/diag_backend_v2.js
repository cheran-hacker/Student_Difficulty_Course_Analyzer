const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function checkPort(port) {
    const BASE_URL = `http://localhost:${port}/api`;
    console.log(`\n--- Checking port ${port} ---`);
    try {
        const ping = await axios.get(`${BASE_URL}/ping`, { timeout: 2000 });
        console.log(`[OK] Ping: ${ping.data}`);

        const routes = await axios.get(`${BASE_URL}/debug-routes`, { timeout: 2000 });
        console.log(`[OK] Debug Routes: ${routes.data.total} routes found.`);

        return true;
    } catch (e) {
        console.error(`[FAIL] Port ${port} check failed: ${e.message}`);
        if (e.response) {
            console.error(`Status: ${e.response.status}`);
            console.error(`Data:`, e.response.data);
        }
        return false;
    }
}

async function diagnostic() {
    await checkPort(5000);
    await checkPort(5001);
}

diagnostic();
