import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { startBot } from './src/bot.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files (CSS, JS, images) from the root directory
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the Express server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFO] Website server running on port ${PORT}`);
    console.log(`[INFO] Access the website at http://localhost:${PORT}`);

    // Start the Discord bot
    console.log('[INFO] Starting Discord bot...');
    startBot();
});

export default app;