// Combined launcher to start both the web server and the Discord bot
// Ensures Railway sees an HTTP listener while the bot runs in the same process

// Start Express server (binds to process.env.PORT)
require('./server.js');

// Start Discord bot
require('./index.js');


