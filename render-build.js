const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, cwd) {
    console.log(`\n[Build] 🚀 Running: ${cmd}${cwd ? ` in ${cwd}` : ''}`);
    try {
        execSync(cmd, {
            cwd: cwd ? path.resolve(__dirname, cwd) : __dirname,
            stdio: 'inherit',
            env: { ...process.env, CI: 'true' }
        });
    } catch (e) {
        console.error(`\n[Build] ❌ FAILED: ${cmd}`);
        process.exit(1);
    }
}

console.log('================================================');
console.log('🏗️  DEFINITIVE RENDER BUILD ORCHESTRATOR');
console.log('================================================');

// 1. Root dependencies
run('npm install');

// 2. Client dependencies
run('npm install', 'client');

// 3. Client Build
console.log('\n[Build] Attempting Client Build (Vite)...');
// We use the direct Node execution of the vite.js file to bypass permission denied errors on the bin executable
const vitePath = path.resolve(__dirname, 'client/node_modules/vite/bin/vite.js');
if (fs.existsSync(vitePath)) {
    run(`node "${vitePath}" build`, 'client');
} else {
    console.error(`[Build] ❌ Vite not found at ${vitePath}. Falling back to npx...`);
    run('npx vite build', 'client');
}

// 4. Server dependencies
run('npm install', 'server');

console.log('\n================================================');
console.log('✅ BUILD COMPLETED SUCCESSFULLY');
console.log('================================================\n');

// Final check
const distPath = path.resolve(__dirname, 'client/dist');
if (fs.existsSync(distPath)) {
    console.log(`[Build] Verification: client/dist exists and contains: ${fs.readdirSync(distPath).length} items.`);
} else {
    console.error('[Build] ❌ CRITICAL: client/dist is STILL missing even after build!');
    process.exit(1);
}
