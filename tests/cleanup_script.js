const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const serverDir = path.join(rootDir, 'server');
const devToolsDir = path.join(serverDir, 'dev_tools');

// Ensure dev_tools exists
if (!fs.existsSync(devToolsDir)) {
    console.log('Creating directory:', devToolsDir);
    fs.mkdirSync(devToolsDir, { recursive: true });
}

// Patterns of files to move
const patterns = [
    /^verify_.*\.js$/,
    /^seed_.*\.js$/,
    /^.*_seeder\.js$/,
    /^debug_.*\.js$/,
    /^check_.*\.js$/,
    /^test_.*\.js$/,
    /^fix_.*\.js$/,
    /^update_.*\.js$/,
    /^nuclear_purge\.js$/,
    /^manual_register\.js$/,
    /^migrate.*\.js$/,
    /^sync_.*\.js$/,
    /^simple_test.*\.js$/,
    /^diag_.*\.js$/,
    /^count_.*\.js$/,
    /^list_.*\.js$/,
    /^.*_upload\.html$/ // legacy html files
];

// Helper to move files
const moveFiles = (sourceDir) => {
    const files = fs.readdirSync(sourceDir);
    files.forEach(file => {
        if (patterns.some(p => p.test(file))) {
            const srcPath = path.join(sourceDir, file);
            const destPath = path.join(devToolsDir, file);

            // Avoid moving if source and dest are same (e.g. if we scan dev_tools itself)
            if (srcPath === destPath) return;

            try {
                fs.renameSync(srcPath, destPath);
                console.log(`Moved: ${file} -> server/dev_tools/${file}`);
            } catch (err) {
                console.error(`Failed to move ${file}:`, err.message);
            }
        }
    });
};

console.log('Cleaning up server directory...');
if (fs.existsSync(serverDir)) moveFiles(serverDir);

console.log('Cleaning up root directory...');
moveFiles(rootDir);

console.log('Cleanup complete.');
