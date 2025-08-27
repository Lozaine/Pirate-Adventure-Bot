const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from JSON to PostgreSQL...');
    
    // Read the existing JSON data
    const dataPath = path.join(__dirname, '../database/gamedata.json');
    const jsonData = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(jsonData);
    
    console.log(`📊 Found ${data.users.length} users and ${data.crews.length} crews to migrate`);
    
    // Migrate crews first (since users reference crews)
    const crewMap = new Map(); // Map old crew IDs to new database IDs
    
    for (const [oldCrewId, crewData] of data.crews) {
      try {
        const result = await pool.query(`
          INSERT INTO crews (
            name, captain, members, level, reputation, bounty, 
            treasury, ships, territories, victories, treasures_found, 
            locations_discovered, created_at, last_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING id
        `, [
          crewData.name,
          crewData.captain,
          JSON.stringify(crewData.members || []),
          crewData.level || 1,
          crewData.reputation || 0,
          crewData.bounty || 0,
          crewData.treasury || 0,
          JSON.stringify(crewData.ships || []),
          JSON.stringify(crewData.territories || []),
          crewData.victories || 0,
          crewData.treasuresFound || 0,
          JSON.stringify(crewData.locationsDiscovered || []),
          crewData.createdAt || new Date(),
          crewData.lastActive || new Date()
        ]);
        
        const newCrewId = result.rows[0].id;
        crewMap.set(oldCrewId, newCrewId);
        console.log(`✅ Migrated crew: ${crewData.name} (ID: ${oldCrewId} → ${newCrewId})`);
      } catch (error) {
        console.error(`❌ Failed to migrate crew ${crewData.name}:`, error.message);
      }
    }
    
    // Migrate users
    for (const [userId, userData] of data.users) {
      try {
        // Convert crewId if user is in a crew
        let newCrewId = null;
        if (userData.crewId && crewMap.has(userData.crewId)) {
          newCrewId = crewMap.get(userData.crewId);
        }
        
        // Convert timestamps
        const lastExplore = userData.lastExplore ? new Date(userData.lastExplore) : null;
        const lastCombat = userData.lastCombat ? new Date(userData.lastCombat) : null;
        const lastTreasure = userData.lastTreasure ? new Date(userData.lastTreasure) : null;
        const lastDevilFruit = userData.lastDevilFruit ? new Date(userData.lastDevilFruit) : null;
        const lastFood = userData.lastFood ? new Date(userData.lastFood) : null;
        const createdAt = userData.createdAt ? new Date(userData.createdAt) : null;
        const lastActive = userData.lastActive ? new Date(userData.lastActive) : null;
        
        const result = await pool.query(`
          INSERT INTO users (
            discord_id, username, level, experience, health, max_health, 
            attack, defense, berries, devil_fruit, devil_fruit_power,
            inventory, equipment, crew_id, crew_role, current_location,
            locations_visited, wins, losses, enemies_defeated, allies,
            treasures_found, active_food_buffs, last_food, last_explore,
            last_combat, last_treasure, last_devil_fruit, created_at, last_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
          RETURNING id
        `, [
          userData.id,
          userData.username,
          userData.level || 1,
          userData.experience || 0,
          userData.health || 100,
          userData.maxHealth || 100,
          userData.attack || 20,
          userData.defense || 10,
          userData.berries || 1000,
          userData.devilFruit ? JSON.stringify(userData.devilFruit) : null,
          userData.devilFruitPower || 0,
          JSON.stringify(userData.inventory || []),
          JSON.stringify(userData.equipment || { weapon: null, armor: null, accessory: null }),
          newCrewId,
          userData.crewRole || 'member',
          userData.currentLocation || 'East Blue',
          JSON.stringify(userData.locationsVisited || ['East Blue']),
          userData.wins || 0,
          userData.losses || 0,
          userData.enemiesDefeated || 0,
          JSON.stringify(userData.allies || []),
          userData.treasuresFound || 0,
          JSON.stringify(userData.activeFoodBuffs || []),
          lastFood,
          lastExplore,
          lastCombat,
          lastTreasure,
          lastDevilFruit,
          createdAt || new Date(),
          lastActive || new Date()
        ]);
        
        console.log(`✅ Migrated user: ${userData.username} (Discord ID: ${userId})`);
      } catch (error) {
        console.error(`❌ Failed to migrate user ${userData.username}:`, error.message);
      }
    }
    
    console.log('🎉 Data migration completed!');
    console.log(`📊 Migrated ${data.users.length} users and ${data.crews.length} crews`);
    
    // Verify migration
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const crewCount = await pool.query('SELECT COUNT(*) FROM crews');
    
    console.log(`🔍 Verification: ${userCount.rows[0].count} users, ${crewCount.rows[0].count} crews in database`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('🎉 Migration finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };
