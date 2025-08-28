require('dotenv').config({ override: true });
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

// SQL to create tables based on the schema
const createTablesSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  
  -- Character stats
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  health INTEGER DEFAULT 100,
  max_health INTEGER DEFAULT 100,
  attack INTEGER DEFAULT 20,
  defense INTEGER DEFAULT 10,
  
  -- Economy
  berries INTEGER DEFAULT 1000,
  
  -- Devil Fruit
  devil_fruit JSONB,
  devil_fruit_power INTEGER DEFAULT 0,
  
  -- Inventory and Equipment
  inventory JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '{"weapon": null, "armor": null, "accessory": null}',
  
  -- Crew
  crew_id INTEGER,
  crew_role VARCHAR(50) DEFAULT 'member',
  
  -- Exploration
  current_location VARCHAR(255) DEFAULT 'East Blue',
  locations_visited JSONB DEFAULT '["East Blue"]',
  
  -- Combat stats
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  enemies_defeated INTEGER DEFAULT 0,
  
  -- Allies found
  allies JSONB DEFAULT '[]',
  
  -- Treasures found
  treasures_found INTEGER DEFAULT 0,
  
  -- Food system
  active_food_buffs JSONB DEFAULT '[]',
  last_food TIMESTAMP,
  
  -- Timestamps
  last_explore TIMESTAMP,
  last_combat TIMESTAMP,
  last_treasure TIMESTAMP,
  last_devil_fruit TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crews table
CREATE TABLE IF NOT EXISTS crews (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  captain VARCHAR(255) NOT NULL,
  members JSONB DEFAULT '[]',
  
  -- Crew stats
  level INTEGER DEFAULT 1,
  reputation INTEGER DEFAULT 0,
  bounty INTEGER DEFAULT 0,
  
  -- Crew resources
  treasury INTEGER DEFAULT 0,
  ships JSONB DEFAULT '[]',
  territories JSONB DEFAULT '[]',
  
  -- Crew achievements
  victories INTEGER DEFAULT 0,
  treasures_found INTEGER DEFAULT 0,
  locations_discovered JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create combat_sessions table
CREATE TABLE IF NOT EXISTS combat_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  enemy JSONB NOT NULL,
  user_health INTEGER NOT NULL,
  user_max_health INTEGER NOT NULL,
  enemy_health INTEGER NOT NULL,
  enemy_max_health INTEGER NOT NULL,
  turn VARCHAR(50) DEFAULT 'user',
  moves JSONB DEFAULT '[]',
  defend_bonus INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_crew_id ON users(crew_id);
CREATE INDEX IF NOT EXISTS idx_crews_captain ON crews(captain);
CREATE INDEX IF NOT EXISTS idx_combat_sessions_user_id ON combat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_combat_sessions_status ON combat_sessions(status);

-- Add foreign key constraint for crew_id (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_crew_id' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_crew_id 
        FOREIGN KEY (crew_id) REFERENCES crews(id) ON DELETE SET NULL;
    END IF;
END $$;
`;

async function setupDatabase() {
  try {
    console.log('🚀 Setting up PostgreSQL database...');
    
    // Create tables
    console.log('📋 Creating tables...');
    await pool.query(createTablesSQL);
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created: users, crews, combat_sessions');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Database setup finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
