# One Piece RPG Discord Bot

A comprehensive Discord RPG bot themed around the One Piece anime/manga universe. Players can register as pirates, explore the Grand Line, engage in combat, collect Devil Fruits, hunt for treasures, form crews, and build their pirate legend.

## Features

### Core Game Systems
- **Character Registration & Progression** - Level up, gain stats, unlock new areas
- **Turn-Based Combat** - Strategic battles with attack, defend, special abilities, and flee options
- **Food System** - 10 consumable items providing temporary combat buffs and healing
- **Exploration System** - Discover new locations, encounter enemies, find treasures and allies
- **Devil Fruit Powers** - Rare abilities that enhance combat and provide unique skills
- **Crew System** - Form pirate crews with shared treasury and collective goals
- **Categorized Shop System** - Browse 7 item categories with detailed descriptions and navigation
- **Equipment System** - Weapons, armor, and accessories with stat bonuses

### Bot Commands (11 Total)
- `/register` - Start your pirate adventure
- `/profile` - View your character stats and progress  
- `/explore` - Explore the Grand Line and find adventures
- `/combat` - View current combat status
- `/shop browse` - Browse categorized shop with page navigation
- `/shop buy <item>` - Purchase items from the shop
- `/shop sell <item>` - Sell inventory items for berries
- `/food menu` - Browse food items by category with effects
- `/food eat <item>` - Consume food for healing and temporary buffs
- `/food buffs` - Check active food bonuses and remaining time
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
- **Food Integration**: Temporary buffs from consumed food apply to combat stats
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
- **Food Buff System**: Temporary combat advantages through strategic food consumption
- **Devil Fruit System**: Rare powers with unique abilities and stat multipliers
- **Health Management**: Combat damage persists, healing through food or level up

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

## Enhanced Features

### Categorized Shop System
The shop now organizes items into 7 dedicated categories for better browsing:

1. **💍 Accessories** - Rings, bandanas, and special stat-boosting items
2. **⚔️ Weapons** - Swords, cutlasses, and combat weapons
3. **🛡️ Armor** - Protective vests, coats, and defensive gear
4. **🍖 Food & Drink** - Consumables with healing and temporary buffs
5. **🧪 Consumables** - Single-use items with various effects
6. **🔧 Tools** - Navigation and utility items for exploration
7. **💎 Materials** - Rare crafting components and special materials

Each category displays full item descriptions, stat bonuses, effects, rarity indicators, and pricing with affordability checks.

### Comprehensive Food System
**10 Strategic Food Items** across 6 categories:

#### 🥩 Meats
- **Sea King Meat** - ₿800: +150 HP, +10 Attack (30 min)
- **Wild Boar** - ₿400: +100 HP, +6 Attack (20 min)

#### 🍱 Prepared Meals
- **Chef's Special** - ₿1200: +250 HP, +12 Attack, +10 Defense (40 min)
- **Sanji Special Bento** - ₿2000: +300 HP, +15 Attack, +12 Defense (60 min)

#### 🍺 Beverages
- **Premium Sake** - ₿200: +75 HP, +8 Attack, -2 Defense (15 min)
- **Fresh Milk** - ₿75: +40 HP, +5 Defense (10 min)
- **Cola** - ₿50: +30 HP (5 min)

#### 🍎 Fruits
- **Devil Fruit Smoothie** - ₿500: +120 HP, +4 Attack, +4 Defense (25 min)

#### 🥨 Snacks
- **Sea Biscuits** - ₿100: +50 HP, +2 Attack (12 min)

#### 🧂 Ingredients
- **Salt** - ₿25: +20 HP (5 min)
- **Sugar** - ₿30: +25 HP (6 min)

### Food Strategic Benefits
- **Pre-Combat Buffing**: Consume food before battles for tactical advantages
- **Duration Management**: Effects last 5-60 minutes requiring strategic planning
- **Real-Time Integration**: Buffs automatically apply to combat calculations
- **Economic Balance**: Choose between equipment investment and consumable advantages
- **Multiple Active Buffs**: Stack different food effects simultaneously

The bot provides a complete RPG experience with persistent progression, strategic combat, enhanced shopping, and engaging food mechanics in the One Piece universe.