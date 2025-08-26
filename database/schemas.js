const USER_SCHEMA = {
    id: null,
    username: '',
    
    // Character stats
    level: 1,
    experience: 0,
    health: 100,
    maxHealth: 100,
    attack: 20,
    defense: 10,
    
    // Economy
    berries: 1000,
    
    // Devil Fruit
    devilFruit: null,
    devilFruitPower: 0,
    
    // Inventory
    inventory: [],
    equipment: {
        weapon: null,
        armor: null,
        accessory: null
    },
    
    // Crew
    crewId: null,
    crewRole: 'member',
    
    // Exploration
    currentLocation: 'East Blue',
    locationsVisited: ['East Blue'],
    
    // Combat stats
    wins: 0,
    losses: 0,
    enemiesDefeated: 0,
    
    // Allies found
    allies: [],
    
    // Treasures found
    treasuresFound: 0,
    
    // Timestamps
    lastExplore: null,
    lastCombat: null,
    lastTreasure: null,
    lastDevilFruit: null,
    
    createdAt: null,
    lastActive: null
};

const CREW_SCHEMA = {
    id: null,
    name: '',
    captain: null,
    members: [],
    
    // Crew stats
    level: 1,
    reputation: 0,
    bounty: 0,
    
    // Crew resources
    treasury: 0,
    ships: [],
    territories: [],
    
    // Crew achievements
    victories: 0,
    treasuresFound: 0,
    locationsDiscovered: [],
    
    createdAt: null,
    lastActive: null
};

const COMBAT_SESSION_SCHEMA = {
    userId: null,
    enemy: null,
    userHealth: 0,
    enemyHealth: 0,
    turn: 'user',
    moves: [],
    startTime: null,
    status: 'active' // active, won, lost, fled
};

module.exports = {
    USER_SCHEMA,
    CREW_SCHEMA,
    COMBAT_SESSION_SCHEMA
};
