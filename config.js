const config = {
    DISCORD_TOKEN: process.env.DISCORD_BOT_TOKEN || 'your_discord_bot_token_here',
    
    // Game configuration
    STARTING_BERRIES: 1000,
    MAX_LEVEL: 100,
    BASE_EXP_REQUIREMENT: 100,
    EXP_MULTIPLIER: 1.2,
    
    // Cooldowns (in milliseconds)
    EXPLORE_COOLDOWN: 30000,      // 30 seconds
    COMBAT_COOLDOWN: 15000,       // 15 seconds
    TREASURE_COOLDOWN: 60000,     // 1 minute
    DEVIL_FRUIT_COOLDOWN: 300000, // 5 minutes
    
    // Drop rates (percentage)
    TREASURE_CHANCE: 15,
    DEVIL_FRUIT_CHANCE: 2,
    ALLY_ENCOUNTER_CHANCE: 10,
    ENEMY_ENCOUNTER_CHANCE: 60,
    
    // Combat settings
    BASE_HEALTH: 100,
    BASE_ATTACK: 20,
    BASE_DEFENSE: 10,
    HEALTH_PER_LEVEL: 15,
    ATTACK_PER_LEVEL: 3,
    DEFENSE_PER_LEVEL: 2,
    
    // Economy settings
    VICTORY_BERRY_BASE: 50,
    VICTORY_EXP_BASE: 25,
    
    // Colors for embeds
    COLORS: {
        PRIMARY: 0x3498db,
        SUCCESS: 0x2ecc71,
        ERROR: 0xe74c3c,
        WARNING: 0xf39c12,
        COMBAT: 0xe67e22,
        TREASURE: 0xf1c40f,
        DEVIL_FRUIT: 0x9b59b6
    }
};

module.exports = config;
