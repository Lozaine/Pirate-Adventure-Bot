# One Piece RPG Discord Bot

A comprehensive Discord RPG bot themed around the One Piece anime/manga universe. Players can register as pirates, explore the Grand Line, engage in combat, collect Devil Fruits, hunt for treasures, form crews, and build their pirate legend.

## Features

### Core Game Systems
- **Character Registration & Progression** - Level up, gain stats, unlock new areas
- **Turn-Based Combat** - Strategic battles with attack, defend, special abilities, and flee options
- **Exploration System** - Discover new locations, encounter enemies, find treasures and allies
- **Devil Fruit Powers** - Rare abilities that enhance combat and provide unique skills
- **Crew System** - Form pirate crews with shared treasury and collective goals
- **Economy & Shop** - Earn and spend Berries on weapons, armor, and items
- **Equipment System** - Weapons, armor, and accessories with stat bonuses

### Bot Commands
- `/register` - Start your pirate adventure
- `/profile` - View your character stats and progress
- `/explore` - Explore the Grand Line and find adventures
- `/combat` - View current combat status
- `/shop` - Browse and buy items with autocomplete
- `/crew` - Manage your pirate crew
- `/treasure` - Search for hidden treasures
- `/devilfruit` - Hunt for rare Devil Fruit powers
- `/wiki` - View game documentation and help

## Installation & Setup

### For Local Development (Replit)
1. Clone this repository
2. Install dependencies: `npm install`
3. Set environment variables:
   - `DISCORD_BOT_TOKEN` - Your Discord bot token
4. Run: `node index.js`

### For Production Deployment (Railway)
1. Deploy to Railway
2. Set environment variables:
   - `DISCORD_BOT_TOKEN` - Your Discord bot token
   - `DATABASE_URL` - PostgreSQL connection string (automatically provided by Railway)
3. The bot will automatically run database migrations on startup
4. Uses PostgreSQL for persistent data storage

## Technical Architecture

### Database Systems
- **Local Development**: JSON file storage (`gamedata.json`)
- **Production**: PostgreSQL with Drizzle ORM
- **Hybrid Storage**: Automatically detects environment and uses appropriate storage

### Core Components
- **Discord.js v14** - Bot framework with slash commands and button interactions
- **Combat System** - Turn-based battles with persistent sessions
- **Cooldown Management** - Prevents command spam and maintains game balance
- **Random Events** - Weighted probability system for encounters and rewards

### File Structure
```
├── commands/           # Slash command handlers
├── data/              # Game data (enemies, items, characters)
├── database/          # Local JSON storage system
├── server/            # PostgreSQL database layer
├── shared/            # Database schema definitions
├── systems/           # Core game systems (combat, exploration)
├── utils/             # Utility functions (cooldowns, randomizer)
├── scripts/           # Database migration scripts
└── index.js           # Main bot entry point
```

## Game Mechanics

### Combat System
- **Turn-Based Flow**: Player → Enemy → Player → Enemy
- **Actions**: Attack, Defend (builds counter-attack bonus), Special (Devil Fruit powers), Flee
- **Enemy AI**: Intelligent behavior with 75% attack / 25% defend strategy
- **Persistent Sessions**: Combat survives server restarts in production

### Exploration & Encounters
- **Random Events**: Enemy encounters, treasure discoveries, ally meetings, new locations
- **Flee Mechanics**: Can escape before combat starts or during battle
- **Location Progression**: Start in East Blue, advance to Grand Line
- **Cooldown System**: 30-second exploration cooldown prevents spam

### Character Progression
- **Experience & Leveling**: Exponential XP requirements with stat gains per level
- **Equipment Slots**: Weapon, armor, accessory with stat bonuses
- **Devil Fruit System**: Rare powers with unique abilities and stat multipliers
- **Health Management**: Combat damage persists, healing through items or level up

## Deployment Notes

### Environment Variables Required
- `DISCORD_BOT_TOKEN` - Discord bot token
- `DATABASE_URL` - PostgreSQL connection (production only)

### Railway Deployment
The bot is ready for Railway deployment with:
- Automatic database migration on startup
- PostgreSQL integration for scalable data storage
- Environment-based configuration switching
- Error handling for database connectivity

### Data Migration
When deploying to Railway, the bot will:
1. Detect PostgreSQL environment
2. Run database migrations automatically
3. Migrate existing JSON data (if needed)
4. Switch to persistent database storage

## Game Balance

### Cooldowns
- Explore: 30 seconds
- Combat: 15 seconds  
- Treasure Hunt: 1 minute
- Devil Fruit Hunt: 5 minutes

### Rewards
- Victory: Berries and experience based on enemy level
- Defeat: 10% health and berry penalty
- Level Up: Full health restore + stat increases

The bot provides a complete RPG experience with persistent progression, strategic combat, and engaging exploration mechanics in the One Piece universe.