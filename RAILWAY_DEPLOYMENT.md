# Railway Deployment Guide

## Files Ready for Railway Deployment

Your website is now properly configured for Railway deployment with the correct port handling.

### Key Files to Upload to Railway:

1. **server.js** - Express server that properly uses `process.env.PORT`
2. **index.html** - Your main website file
3. **style.css** - Website styling
4. **script.js** - Website functionality
5. **package.json** - Dependencies (discord.js, express, etc.)

### Railway Configuration:

1. **Start Command**: `node server.js`
2. **Port**: Uses `process.env.PORT` (Railway automatically sets this)
3. **Domain**: `https://pirate-adventure-bot-production.up.railway.app`

### How the Server Works:

- **Static Files**: Serves CSS, JS, and other assets from root directory
- **Routing**: All page routes (`/`, `/about`, `/commands`, etc.) serve the same `index.html`
- **Client-Side Navigation**: JavaScript handles page switching without full reloads
- **Port Binding**: Uses Railway's dynamic PORT environment variable

### Deployment Steps:

1. Copy these files to your Railway project:
   - `server.js`
   - `index.html` 
   - `style.css`
   - `script.js`

2. Make sure your Railway project has these dependencies:
   - `express`
   - `discord.js`
   - `@neondatabase/serverless`
   - `drizzle-orm`
   - `ws`

3. Set Railway start command to: `node server.js`

4. Deploy and your website will be live at: `https://pirate-adventure-bot-production.up.railway.app`

### Current Status:

✅ Server properly configured with `process.env.PORT`  
✅ Express routes handle all website pages  
✅ Static file serving works correctly  
✅ All links reference correct Railway domain  
✅ Terms & Conditions and Privacy Policy included  
✅ Discord community link integrated  

Your website is now ready for Railway deployment!