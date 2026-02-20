const bcrypt = require('bcryptjs');

async function testHash() {
    console.log('Testing hashing...');
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Plain:', password);
    console.log('Hashed:', hashedPassword);

    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Match:', isMatch);
}

testHash();
