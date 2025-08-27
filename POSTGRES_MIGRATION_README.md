# PostgreSQL Migration Guide for One Piece RPG Bot

This guide will help you migrate your One Piece RPG bot from the file-based JSON database to a PostgreSQL database hosted on Railway.

## 🚀 Prerequisites

1. **Railway Account**: Make sure you have a Railway account and have created a PostgreSQL database
2. **Environment Variables**: Your `DATABASE_URL` should be set in your Railway environment
3. **Node.js**: Ensure you have Node.js installed locally for running migration scripts

## 📋 Step-by-Step Migration

### Step 1: Install Dependencies

First, install the required PostgreSQL dependencies:

```bash
npm install pg@^8.11.3
```

### Step 2: Set Environment Variables

Make sure your Railway environment has the `DATABASE_URL` variable set. It should look like:
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### Step 3: Run the Migration

Execute the full migration script:

```bash
node scripts/migrate-to-postgres.js
```

This script will:
1. Create all necessary database tables
2. Migrate your existing user and crew data
3. Set up proper indexes and foreign key constraints

### Step 4: Update Your Bot Code

Replace the old database import in your main bot file:

**Before:**
```javascript
const database = require('./database/database');
```

**After:**
```javascript
const database = require('./database/postgresDatabase');
```

### Step 5: Test Your Bot

1. Start your bot and test basic functionality
2. Verify that user data is being loaded correctly
3. Test user registration, crew creation, and other features

### Step 6: Clean Up (Optional)

Once you're confident everything is working:
1. Remove `database/database.js`
2. Remove `database/gamedata.json`
3. Remove `database/schemas.js`

## 🗄️ Database Schema

The migration creates three main tables:

### Users Table
- **discord_id**: Unique Discord user ID
- **username**: Discord username
- **Character stats**: level, experience, health, attack, defense
- **Economy**: berries, inventory, equipment
- **Crew**: crew_id, crew_role
- **Exploration**: current_location, locations_visited
- **Combat**: wins, losses, enemies_defeated
- **Timestamps**: created_at, last_active

### Crews Table
- **name**: Unique crew name
- **captain**: Discord ID of crew captain
- **members**: JSON array of member Discord IDs
- **Stats**: level, reputation, bounty, treasury
- **Resources**: ships, territories
- **Achievements**: victories, treasures_found

### Combat Sessions Table
- **user_id**: Discord ID of the user in combat
- **enemy**: JSON data of the enemy
- **Combat state**: user_health, enemy_health, turn, status
- **Timestamps**: start_time

## 🔧 Troubleshooting

### Common Issues

1. **Connection Error**: Ensure your `DATABASE_URL` is correct and the database is accessible
2. **SSL Error**: The migration script automatically handles SSL for production environments
3. **Permission Error**: Make sure your database user has CREATE TABLE and INSERT permissions

### Rollback Plan

If something goes wrong, you can:
1. Keep your original `gamedata.json` file as backup
2. Drop the PostgreSQL tables and restart
3. Continue using the old file-based system

## 📊 Data Verification

After migration, verify your data:

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check crew count  
SELECT COUNT(*) FROM crews;

-- Verify a specific user
SELECT * FROM users WHERE discord_id = 'YOUR_DISCORD_ID';
```

## 🎯 Benefits of PostgreSQL

1. **Scalability**: Handle thousands of users without performance issues
2. **Reliability**: ACID compliance and automatic backups
3. **Performance**: Optimized queries and indexing
4. **Concurrency**: Multiple users can interact simultaneously
5. **Data Integrity**: Foreign key constraints and data validation

## 🆘 Support

If you encounter issues:
1. Check the Railway logs for database connection errors
2. Verify your environment variables are set correctly
3. Ensure your database is running and accessible
4. Check that all required dependencies are installed

## 🎉 Success!

Once migration is complete, your One Piece RPG bot will be running on a robust PostgreSQL database hosted on Railway, ready to handle your growing pirate community!
