
const express = require('express');
const app = express();
const PORT = 5001; // Use a different port

app.get('/', (req, res) => {
    res.send('Test server is running on 5001');
});

app.listen(PORT, () => {
    console.log(`Test server listening on port ${PORT}`);
});
