const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Favicon support
app.get('/favicon.ico', (req, res) => {
    res.type('image/png');
    res.sendFile(path.join(__dirname, 'favicon.png'));
});

// Serve the main HTML file for all routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle specific routes that might be accessed directly
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/commands', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/guides', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/changelog', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFO] Website server running on port ${PORT}`);
    console.log(`[INFO] Server accessible at http://localhost:${PORT}`);
});

module.exports = app;