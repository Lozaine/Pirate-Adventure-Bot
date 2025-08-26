const fs = require('fs').promises;
const path = require('path');
const schemas = require('./schemas.js');

class Database {
    constructor() {
        this.data = {
            users: new Map(),
            crews: new Map(),
            guilds: new Map()
        };
        this.dataFile = path.join(__dirname, 'gamedata.json');
        this.saveInterval = null;
    }

    async initialize() {
        try {
            // Load existing data
            await this.loadData();
            
            // Start auto-save every 5 minutes
            this.saveInterval = setInterval(() => {
                this.saveData();
            }, 300000);
            
            console.log('[INFO] Database initialized successfully');
        } catch (error) {
            console.error('[ERROR] Failed to initialize database:', error);
        }
    }

    async loadData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            const parsed = JSON.parse(data);
            
            // Convert arrays back to Maps
            if (parsed.users) {
                this.data.users = new Map(parsed.users);
            }
            if (parsed.crews) {
                this.data.crews = new Map(parsed.crews);
            }
            if (parsed.guilds) {
                this.data.guilds = new Map(parsed.guilds);
            }
            
            console.log(`[INFO] Loaded ${this.data.users.size} users, ${this.data.crews.size} crews`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('[INFO] No existing data file found, starting fresh');
            } else {
                console.error('[ERROR] Error loading data:', error);
            }
        }
    }

    async saveData() {
        try {
            const dataToSave = {
                users: Array.from(this.data.users.entries()),
                crews: Array.from(this.data.crews.entries()),
                guilds: Array.from(this.data.guilds.entries()),
                lastSaved: new Date().toISOString()
            };
            
            await fs.writeFile(this.dataFile, JSON.stringify(dataToSave, null, 2));
            console.log('[INFO] Data saved successfully');
        } catch (error) {
            console.error('[ERROR] Error saving data:', error);
        }
    }

    // User methods
    getUser(userId) {
        return this.data.users.get(userId);
    }

    createUser(userId, username) {
        const newUser = {
            ...schemas.USER_SCHEMA,
            id: userId,
            username: username,
            createdAt: new Date().toISOString()
        };
        this.data.users.set(userId, newUser);
        return newUser;
    }

    updateUser(userId, updates) {
        const user = this.data.users.get(userId);
        if (user) {
            Object.assign(user, updates);
            this.data.users.set(userId, user);
        }
        return user;
    }

    // Crew methods
    getCrew(crewId) {
        return this.data.crews.get(crewId);
    }

    createCrew(crewId, captainId, name) {
        const newCrew = {
            ...schemas.CREW_SCHEMA,
            id: crewId,
            name: name,
            captain: captainId,
            members: [captainId],
            createdAt: new Date().toISOString()
        };
        this.data.crews.set(crewId, newCrew);
        return newCrew;
    }

    updateCrew(crewId, updates) {
        const crew = this.data.crews.get(crewId);
        if (crew) {
            Object.assign(crew, updates);
            this.data.crews.set(crewId, crew);
        }
        return crew;
    }

    // Utility methods
    getAllUsers() {
        return Array.from(this.data.users.values());
    }

    getAllCrews() {
        return Array.from(this.data.crews.values());
    }

    // Cleanup method
    async shutdown() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        await this.saveData();
        console.log('[INFO] Database shutdown complete');
    }
}

// Create singleton instance
const database = new Database();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('[INFO] Received SIGINT, shutting down gracefully...');
    await database.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('[INFO] Received SIGTERM, shutting down gracefully...');
    await database.shutdown();
    process.exit(0);
});

module.exports = database;
