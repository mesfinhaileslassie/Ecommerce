const express = require('express');
const app = express();

// Simple test route
app.get('/test', (req, res) => {
    res.json({ message: 'Test route works!' });
});

// Another test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API test route works!' });
});

// Root route
app.get('/', (req, res) => {
    res.send('Test server is running');
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Try: http://localhost:${PORT}/test`);
    console.log(`Try: http://localhost:${PORT}/api/test`);
});