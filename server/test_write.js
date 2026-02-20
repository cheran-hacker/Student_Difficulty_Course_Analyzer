const fs = require('fs');
console.log('Writing test file...');
try {
    fs.writeFileSync('test_write_success.txt', 'Node is working!');
    console.log('Success!');
} catch (e) {
    console.error('Error:', e);
}
