const { Pool } = require('pg');

class PostgresDatabase {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    async initialize() {
        try {
            // Test connection
            await this.pool.query('SELECT NOW()');
            console.log('[INFO] PostgreSQL database connected successfully');
        } catch (error) {
            console.error('[ERROR] Failed to connect to PostgreSQL database:', error);
            throw error;
        }
    }

    // User methods
    async getUser(discordId) {
        try {
            const result = await this.pool.query(
                'SELECT * FROM users WHERE discord_id = $1',
                [discordId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('[ERROR] Error getting user:', error);
            return null;
        }
    }

    async createUser(discordId, username) {
        try {
            const result = await this.pool.query(`
                INSERT INTO users (
                    discord_id, username, level, experience, health, max_health,
                    attack, defense, berries, devil_fruit, devil_fruit_power,
                    inventory, equipment, crew_id, crew_role, current_location,
                    locations_visited, wins, losses, enemies_defeated, allies,
                    treasures_found, active_food_buffs, created_at, last_active
                ) VALUES ($1, $2, 1, 0, 100, 100, 20, 10, 1000, null, 0, 
                         '[]', '{"weapon": null, "armor": null, "accessory": null}', 
                         null, 'member', 'East Blue', '["East Blue"]', 0, 0, 0, 
                         '[]', 0, '[]', NOW(), NOW())
                RETURNING *
            `, [discordId, username]);
            
            return result.rows[0];
        } catch (error) {
            console.error('[ERROR] Error creating user:', error);
            return null;
        }
    }

    async updateUser(discordId, updates) {
        try {
            const setClause = [];
            const values = [];
            let paramCount = 1;

            const processedKeys = new Set(); // Track processed keys to prevent duplicates
            
            for (const [key, value] of Object.entries(updates)) {
                if (key === 'id' || key === 'discord_id') continue; // Skip protected fields
                
                // Convert camelCase to snake_case
                const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                
                // Skip if we've already processed this database key
                if (processedKeys.has(dbKey)) continue;
                processedKeys.add(dbKey);
                
                setClause.push(`${dbKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }

            if (setClause.length === 0) return null;

            values.push(discordId);
            
            // Check if last_active is already being set to avoid duplication
            const hasLastActive = setClause.some(clause => clause.includes('last_active'));
            const finalSetClause = hasLastActive ? setClause.join(', ') : setClause.join(', ') + ', last_active = NOW()';
            
            const result = await this.pool.query(`
                UPDATE users SET ${finalSetClause}
                WHERE discord_id = $${paramCount}
                RETURNING *
            `, values);

            return result.rows[0] || null;
        } catch (error) {
            console.error('[ERROR] Error updating user:', error);
            return null;
        }
    }

    // Crew methods
    async getCrew(crewId) {
        try {
            const result = await this.pool.query(
                'SELECT * FROM crews WHERE id = $1',
                [crewId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('[ERROR] Error getting crew:', error);
            return null;
        }
    }

    async createCrew(name, captainId) {
        try {
            const result = await this.pool.query(`
                INSERT INTO crews (
                    name, captain, members, level, reputation, bounty,
                    treasury, ships, territories, victories, treasures_found,
                    locations_discovered, created_at, last_active
                ) VALUES ($1, $2, $3, 1, 0, 0, 0, '[]', '[]', 0, 0, '[]', NOW(), NOW())
                RETURNING *
            `, [name, captainId, JSON.stringify([captainId])]);
            
            return result.rows[0];
        } catch (error) {
            console.error('[ERROR] Error creating crew:', error);
            return null;
        }
    }

    async updateCrew(crewId, updates) {
        try {
            const setClause = [];
            const values = [];
            let paramCount = 1;

            for (const [key, value] of Object.entries(updates)) {
                if (key === 'id') continue; // Skip protected fields
                
                // Convert camelCase to snake_case
                const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                
                setClause.push(`${dbKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }

            if (setClause.length === 0) return null;

            values.push(crewId);
            const result = await this.pool.query(`
                UPDATE crews SET ${setClause.join(', ')}, last_active = NOW()
                WHERE id = $${paramCount}
                RETURNING *
            `, values);

            return result.rows[0] || null;
        } catch (error) {
            console.error('[ERROR] Error updating crew:', error);
            return null;
        }
    }

    // Combat session methods
    async createCombatSession(userId, enemy, userHealth, userMaxHealth, enemyHealth, enemyMaxHealth) {
        try {
            const result = await this.pool.query(`
                INSERT INTO combat_sessions (
                    user_id, enemy, user_health, user_max_health, enemy_health, 
                    enemy_max_health, turn, moves, defend_bonus, status, start_time
                ) VALUES ($1, $2, $3, $4, $5, $6, 'user', '[]', 0, 'active', NOW())
                RETURNING *
            `, [userId, JSON.stringify(enemy), userHealth, userMaxHealth, enemyHealth, enemyMaxHealth]);
            
            return result.rows[0];
        } catch (error) {
            console.error('[ERROR] Error creating combat session:', error);
            return null;
        }
    }

    async updateCombatSession(sessionId, updates) {
        try {
            const setClause = [];
            const values = [];
            let paramCount = 1;

            for (const [key, value] of Object.entries(updates)) {
                if (key === 'id') continue; // Skip protected fields
                
                // Convert camelCase to snake_case
                const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                
                setClause.push(`${dbKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }

            if (setClause.length === 0) return null;

            values.push(sessionId);
            const result = await this.pool.query(`
                UPDATE combat_sessions SET ${setClause.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `, values);

            return result.rows[0] || null;
        } catch (error) {
            console.error('[ERROR] Error updating combat session:', error);
            return null;
        }
    }

    async getCombatSession(sessionId) {
        try {
            const result = await this.pool.query(
                'SELECT * FROM combat_sessions WHERE id = $1',
                [sessionId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('[ERROR] Error getting combat session:', error);
            return null;
        }
    }

    // Utility methods
    async getAllUsers() {
        try {
            const result = await this.pool.query('SELECT * FROM users ORDER BY created_at DESC');
            return result.rows;
        } catch (error) {
            console.error('[ERROR] Error getting all users:', error);
            return [];
        }
    }

    async getAllCrews() {
        try {
            const result = await this.pool.query('SELECT * FROM crews ORDER BY created_at DESC');
            return result.rows;
        } catch (error) {
            console.error('[ERROR] Error getting all crews:', error);
            return [];
        }
    }

    // Cleanup method
    async shutdown() {
        try {
            await this.pool.end();
            console.log('[INFO] PostgreSQL database connection closed');
        } catch (error) {
            console.error('[ERROR] Error closing database connection:', error);
        }
    }
}

// Create singleton instance
const postgresDatabase = new PostgresDatabase();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('[INFO] Received SIGINT, shutting down gracefully...');
    await postgresDatabase.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('[INFO] Received SIGTERM, shutting down gracefully...');
    await postgresDatabase.shutdown();
    process.exit(0);
});

module.exports = postgresDatabase;
