# One Piece RPG Discord Bot

## Overview

This is a comprehensive Discord RPG bot themed around the One Piece anime/manga universe. Players can register as pirates, explore the Grand Line, engage in combat, collect Devil Fruits, hunt for treasures, form crews, and build their pirate legend. The bot features a complete game system with character progression, equipment, economy, and social elements.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Enhanced Shop & Food System (Latest)
- **Categorized Shop System**: Complete redesign with 7 dedicated category pages
  - Page 1: 💍 Accessories (rings, bandanas, special stat items)
  - Page 2: ⚔️ Weapons (swords, cutlasses, combat gear)
  - Page 3: 🛡️ Armor (protective vests, coats, suits)
  - Page 4: 🍖 Food & Drink (consumables with temporary buffs)
  - Page 5: 🧪 Consumables (single-use effect items)
  - Page 6: 🔧 Tools (navigation, utility items)
  - Page 7: 💎 Materials (rare crafting components)
- **Comprehensive Food System**: 10 food items across 6 categories with strategic gameplay
  - Temporary combat buffs lasting 5-60 minutes
  - Strategic healing and stat bonuses for tactical combat advantages
  - Food categories: Meats, Prepared Meals, Beverages, Fruits, Snacks, Ingredients
  - Integration with combat system for real-time buff calculations
- **Enhanced Shop Display**: Full item descriptions, stat bonuses, rarity indicators, page navigation
- **New /food Commands**: menu, eat, and buffs subcommands for food management
- **Combat Integration**: Food buffs now apply in real-time during battles

### Previous Combat System & Database Migration
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
- **Food System**: Comprehensive consumable system with 10 food items providing temporary combat buffs
- **Experience & Leveling**: Character progression with exponential XP requirements
- **Equipment System**: Weapons, armor, and accessories with stat bonuses
- **Devil Fruit System**: Rare powers with unique abilities and stat multipliers
- **Crew System**: Social groups with shared treasury, reputation, and collective goals
- **Economy System**: Berry currency, categorized shop with page navigation, inventory management, and trading

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
- **Food Database**: 10 strategic food items with healing effects and temporary combat buffs
- **Categorized Shop System**: 7-page shop organization with detailed item displays and navigation
- **Character Database**: One Piece universe characters for ally encounters

## Command System

### Available Slash Commands (11 Total)
1. **`/register`** - Start your pirate adventure and create character
2. **`/profile`** - View character stats, equipment, and progression
3. **`/explore`** - Explore the Grand Line for encounters and discoveries
4. **`/combat`** - View and manage current combat status
5. **`/shop browse`** - Browse categorized shop with page navigation
6. **`/shop buy <item>`** - Purchase items from the shop
7. **`/shop sell <item>`** - Sell inventory items for berries
8. **`/food menu`** - Browse food items by category with effects
9. **`/food eat <item>`** - Consume food for healing and temporary buffs
10. **`/food buffs`** - Check active food bonuses and remaining time
11. **`/crew`** - Manage pirate crew operations
12. **`/treasure`** - Hunt for hidden treasures
13. **`/devilfruit`** - Search for rare Devil Fruit powers
14. **`/wiki`** - Access game documentation and help

## Food System Details

### Food Categories & Strategic Uses
- **🥩 Meats**: High healing + attack bonuses (Sea King Meat, Wild Boar)
- **🍱 Prepared Meals**: Balanced stats + extended duration (Chef's Special, Sanji Special Bento)
- **🍺 Beverages**: Quick effects + mixed bonuses (Premium Sake, Fresh Milk)
- **🍎 Fruits**: Health-focused with moderate bonuses (Devil Fruit Smoothie)
- **🥨 Snacks**: Light effects + affordable prices (Sea Biscuits)
- **🧂 Ingredients**: Basic healing for budget-conscious pirates (Salt, Sugar)

### Combat Integration
- **Real-time Buff Application**: Food effects automatically calculated in combat
- **Strategic Timing**: Consume food before battles for maximum advantage
- **Duration Management**: Buffs expire naturally, requiring strategic planning
- **Stacking Rules**: Multiple food buffs can be active simultaneously

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

## Latest Features

### Enhanced Shopping Experience
- **Category-Based Navigation**: Browse items by type with dedicated pages
- **Rich Item Display**: Full descriptions, stat bonuses, effects, and rarity indicators
- **Improved UX**: Clear pricing, affordability indicators, and smooth page navigation

### Strategic Food System
- **Temporary Advantages**: Food provides combat bonuses lasting 5-60 minutes
- **Economic Strategy**: Balance berry spending between equipment and consumables
- **Combat Planning**: Pre-battle food consumption for tactical advantages
- **Inventory Management**: Food items stored in player inventory for later use