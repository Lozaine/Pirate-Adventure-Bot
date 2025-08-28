# One Piece Discord Bot

## Project Overview
This is a One Piece themed Discord bot with RPG elements, built with Node.js, Discord.js, and PostgreSQL. The bot features combat, exploration, devil fruits, crew systems, and economic gameplay.

## Project Architecture
- **Discord Bot**: Main bot application (`index.js`) with slash commands
- **Web Server**: Express server (`server.js`) for web interface
- **Database**: PostgreSQL with custom connection handling
- **Commands**: Modular command system in `/commands` directory
- **Systems**: Game mechanics in `/systems` directory
- **Data**: Static game data in `/data` directory

## Current Workflows
1. **Discord Bot Server**: Runs the main bot (`node index.js`)
2. **Website Server**: Runs the web interface (`node server.js`)

## User Preferences
- Migrating from Replit Agent to standard Replit environment
- Focus on security and proper dependency management
- Maintain existing functionality while ensuring compatibility

## Recent Changes
- **2024-12-28**: Starting migration from Replit Agent to standard Replit
- **Issue**: Missing `pg` module causing Discord Bot Server to fail
- **Solution**: Installing proper Node.js dependencies via packager tool
- **Fixed**: Database field naming inconsistencies (devil_fruit, active_food_buffs)
- **Fixed**: Database duplicate column assignment error in updateUser method
- **Fixed**: Treasure command Discord.js embed validation errors
- **Fixed**: JSON parsing errors in database operations - added proper JSON stringification for JSONB fields
- **Status**: All systems operational, bot fully functional with all 11 commands

- **2025-08-28**: Fixed critical JSON parsing errors in PostgreSQL operations
- **Issue**: Invalid JSON syntax errors when updating user/crew/combat data
- **Root Cause**: Objects and arrays were being passed directly to JSONB columns without proper stringification
- **Solution**: Enhanced updateUser, updateCrew, and updateCombatSession methods to automatically stringify JSON fields
- **Fields Fixed**: inventory, equipment, locations_visited, allies, active_food_buffs, members, ships, territories, enemy, moves
- **Status**: Database operations now working correctly, no more JSON parsing errors

## Dependencies
- discord.js: Discord API wrapper
- pg: PostgreSQL client
- express: Web server framework
- dotenv: Environment variable management
- drizzle-orm: Database ORM
- @neondatabase/serverless: Neon database client
- ws: WebSocket library

## Environment Variables Required
- DATABASE_URL: PostgreSQL connection string
- (Discord bot token and other secrets need to be configured)

## Migration Status
- Installing required packages ✓
- Fixed DATABASE_URL connection issues ✓
- Set up database schema and tables ✓
- Discord Bot Server fully operational ✓
- Website Server running successfully ✓
- Migration completed successfully ✓