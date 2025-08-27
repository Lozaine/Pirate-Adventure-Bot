# One Piece RPG Discord Bot

## Overview

This is a comprehensive Discord RPG bot themed around the One Piece anime/manga universe. Players can register as pirates, explore the Grand Line, engage in combat, collect Devil Fruits, hunt for treasures, form crews, and build their pirate legend. The bot features a complete game system with character progression, equipment, economy, and social elements.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Complete Combat System & Database Migration (Latest)
- Fixed combat system Fight & Flee buttons - now fully functional
- Added proper turn-based combat flow with automatic enemy responses
- Fixed flee button to work from enemy encounter screen (before combat starts)
- Implemented PostgreSQL database support for Railway deployment
- Created hybrid storage system (JSON for Replit, PostgreSQL for Railway)
- Added database migration scripts and complete schema
- Removed `/guide` command, keeping only `/wiki` for documentation
- All combat sessions now persist through server restarts in production

## System Architecture

### Bot Architecture
- **Discord.js Framework**: Built on Discord.js v14 with slash commands and button interactions
- **Command System**: Modular command structure with automatic loading from the `/commands` directory
- **Event-Driven**: Uses Discord gateway intents for guilds, messages, and message content
- **Cooldown Management**: Built-in cooldown system to prevent command spam and maintain game balance

### Data Storage
- **Hybrid Database System**: JSON file storage for Replit, PostgreSQL for Railway deployment
- **In-Memory Maps**: Uses JavaScript Maps for fast data access during runtime
- **Auto-Save**: Periodic data persistence every 5 minutes to prevent data loss
- **Schema Validation**: Structured data schemas for users, crews, and combat sessions
- **Database Migration**: Automatic PostgreSQL setup for production deployment

### Game Systems
- **Combat System**: Turn-based combat with health, attack, defense stats and special abilities
- **Experience & Leveling**: Character progression with exponential XP requirements
- **Equipment System**: Weapons, armor, and accessories with stat bonuses
- **Devil Fruit System**: Rare powers with unique abilities and stat multipliers
- **Crew System**: Social groups with shared treasury, reputation, and collective goals
- **Economy System**: Berry currency, item shop, inventory management, and trading

### Game Mechanics
- **Exploration**: Random encounters with enemies, treasures, allies, and new locations
- **Cooldown System**: Time-based restrictions on activities (explore: 30s, combat: 15s, treasure: 1m, devil fruit: 5m)
- **Randomization**: Weighted probability system for drops, encounters, and rewards
- **Location System**: Progressive world exploration from East Blue to Grand Line
- **Character Customization**: Equipment slots and Devil Fruit powers affecting gameplay

### Content Systems
- **Dynamic Enemy Generation**: Level-scaled enemies with location-based spawning
- **Treasure Hunting**: Randomized treasure discovery with varying rarities and values
- **Item Database**: Comprehensive equipment system with weapons, armor, and consumables
- **Character Database**: One Piece universe characters for ally encounters

## External Dependencies

### Core Dependencies
- **discord.js v14.22.1**: Primary Discord API wrapper for bot functionality
- **Node.js**: Runtime environment (requires v16.11.0+)

### File System
- **fs/promises**: Asynchronous file operations for database persistence
- **path**: File path utilities for cross-platform compatibility

### Data Storage & Production
- **Development**: JSON file-based storage for game data persistence in Replit environment
- **Production**: PostgreSQL database with Drizzle ORM for Railway deployment
- **Migration Scripts**: Automatic database setup and schema creation
- **Hybrid Storage**: Environment detection switches between local files and PostgreSQL

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **drizzle-orm**: TypeScript ORM for database operations
- **ws**: WebSocket library for database connections

The application now supports both local development with JSON files and production deployment with PostgreSQL, providing scalability and data persistence for Railway hosting.