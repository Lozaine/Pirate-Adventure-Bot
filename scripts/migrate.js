const { Pool } = require('@neondatabase/serverless');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Creating database tables...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        discord_id VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        health INTEGER DEFAULT 100,
        max_health INTEGER DEFAULT 100,
        attack INTEGER DEFAULT 20,
        defense INTEGER DEFAULT 10,
        berries INTEGER DEFAULT 1000,
        devil_fruit JSONB,
        devil_fruit_power INTEGER DEFAULT 0,
        inventory JSONB DEFAULT '[]',
        equipment JSONB DEFAULT '{"weapon": null, "armor": null, "accessory": null}',
        crew_id INTEGER,
        crew_role VARCHAR(50) DEFAULT 'member',
        current_location VARCHAR(255) DEFAULT 'East Blue',
        locations_visited JSONB DEFAULT '["East Blue"]',
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        enemies_defeated INTEGER DEFAULT 0,
        allies JSONB DEFAULT '[]',
        treasures_found INTEGER DEFAULT 0,
        last_explore TIMESTAMP,
        last_combat TIMESTAMP,
        last_treasure TIMESTAMP,
        last_devil_fruit TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        last_active TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create crews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        captain VARCHAR(255) NOT NULL,
        members JSONB DEFAULT '[]',
        level INTEGER DEFAULT 1,
        reputation INTEGER DEFAULT 0,
        bounty INTEGER DEFAULT 0,
        treasury INTEGER DEFAULT 0,
        ships JSONB DEFAULT '[]',
        territories JSONB DEFAULT '[]',
        victories INTEGER DEFAULT 0,
        treasures_found INTEGER DEFAULT 0,
        locations_discovered JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        last_active TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create combat_sessions table
    await pool.query(`
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
        start_time TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();