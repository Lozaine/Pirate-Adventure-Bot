const randomizer = require('../utils/randomizer.js');

const enemyTemplates = {
    // East Blue enemies (Levels 1-15)
    eastBlue: [
        {
            name: 'Buggy Pirate',
            baseLevel: 3,
            type: 'pirate',
            description: 'A member of Buggy\'s crew with a red nose.',
            attackRange: [0.8, 1.2],
            healthRange: [0.9, 1.1],
            defenseRange: [0.8, 1.0]
        },
        {
            name: 'Arlong Fishman',
            baseLevel: 8,
            type: 'fishman',
            description: 'A fierce fishman warrior from Arlong\'s crew.',
            attackRange: [1.1, 1.3],
            healthRange: [1.2, 1.4],
            defenseRange: [0.9, 1.1]
        },
        {
            name: 'Marine Ensign',
            baseLevel: 5,
            type: 'marine',
            description: 'A low-ranking Marine officer.',
            attackRange: [0.9, 1.1],
            healthRange: [1.0, 1.2],
            defenseRange: [1.0, 1.3]
        },
        {
            name: 'Kuro\'s Cat',
            baseLevel: 4,
            type: 'animal',
            description: 'One of Captain Kuro\'s trained cats.',
            attackRange: [1.2, 1.4],
            healthRange: [0.7, 0.9],
            defenseRange: [0.6, 0.8]
        },
        {
            name: 'Don Krieg Soldier',
            baseLevel: 7,
            type: 'pirate',
            description: 'A heavily armored member of the Krieg Pirates.',
            attackRange: [0.9, 1.1],
            healthRange: [1.1, 1.3],
            defenseRange: [1.2, 1.5]
        }
    ],

    // Grand Line enemies (Levels 16-40)
    grandLine: [
        {
            name: 'Baroque Works Agent',
            baseLevel: 18,
            type: 'assassin',
            description: 'A mysterious agent working for Crocodile.',
            attackRange: [1.2, 1.4],
            healthRange: [0.9, 1.1],
            defenseRange: [0.8, 1.0]
        },
        {
            name: 'Sky Island Warrior',
            baseLevel: 25,
            type: 'skypiean',
            description: 'A winged warrior from the Sky Islands.',
            attackRange: [1.1, 1.3],
            healthRange: [1.0, 1.2],
            defenseRange: [0.9, 1.1]
        },
        {
            name: 'CP9 Agent',
            baseLevel: 30,
            type: 'government',
            description: 'An elite World Government assassin.',
            attackRange: [1.4, 1.6],
            healthRange: [1.2, 1.4],
            defenseRange: [1.1, 1.3]
        },
        {
            name: 'Thriller Bark Zombie',
            baseLevel: 22,
            type: 'undead',
            description: 'A reanimated corpse from Gecko Moria\'s ship.',
            attackRange: [1.0, 1.2],
            healthRange: [1.5, 1.8],
            defenseRange: [0.7, 0.9]
        },
        {
            name: 'Supernova Crew Member',
            baseLevel: 35,
            type: 'pirate',
            description: 'A member of one of the Eleven Supernovas\' crews.',
            attackRange: [1.3, 1.5],
            healthRange: [1.1, 1.3],
            defenseRange: [1.0, 1.2]
        }
    ],

    // New World enemies (Levels 41-70)
    newWorld: [
        {
            name: 'Yonko Subordinate',
            baseLevel: 45,
            type: 'elite_pirate',
            description: 'A powerful pirate serving under one of the Four Emperors.',
            attackRange: [1.5, 1.8],
            healthRange: [1.4, 1.6],
            defenseRange: [1.2, 1.4]
        },
        {
            name: 'Marine Vice Admiral',
            baseLevel: 55,
            type: 'marine_elite',
            description: 'A high-ranking Marine officer with Haki abilities.',
            attackRange: [1.6, 1.9],
            healthRange: [1.5, 1.7],
            defenseRange: [1.4, 1.6]
        },
        {
            name: 'Revolutionary Army Commander',
            baseLevel: 50,
            type: 'revolutionary',
            description: 'A commander in Dragon\'s Revolutionary Army.',
            attackRange: [1.4, 1.7],
            healthRange: [1.3, 1.5],
            defenseRange: [1.1, 1.3]
        },
        {
            name: 'Warlord\'s Right Hand',
            baseLevel: 60,
            type: 'warlord_ally',
            description: 'The trusted lieutenant of a Shichibukai.',
            attackRange: [1.7, 2.0],
            healthRange: [1.6, 1.8],
            defenseRange: [1.3, 1.5]
        }
    ],

    // End Game enemies (Levels 71+)
    endGame: [
        {
            name: 'Marine Admiral',
            baseLevel: 75,
            type: 'admiral',
            description: 'One of the three Marine Admirals with devastating Devil Fruit powers.',
            attackRange: [2.0, 2.5],
            healthRange: [2.0, 2.3],
            defenseRange: [1.8, 2.0]
        },
        {
            name: 'Yonko Commander',
            baseLevel: 80,
            type: 'yonko_commander',
            description: 'A commander serving directly under a Yonko.',
            attackRange: [2.2, 2.7],
            healthRange: [2.1, 2.4],
            defenseRange: [1.9, 2.1]
        },
        {
            name: 'Celestial Dragon Guard',
            baseLevel: 85,
            type: 'world_noble_guard',
            description: 'An elite guard protecting the World Nobles.',
            attackRange: [2.3, 2.8],
            healthRange: [2.2, 2.5],
            defenseRange: [2.0, 2.3]
        },
        {
            name: 'Five Elders\' Agent',
            baseLevel: 90,
            type: 'world_government_elite',
            description: 'A mysterious agent working directly for the Five Elders.',
            attackRange: [2.5, 3.0],
            healthRange: [2.4, 2.7],
            defenseRange: [2.2, 2.5]
        }
    ]
};

class EnemySystem {
    generateEnemyForLevel(userLevel, location = 'East Blue') {
        const levelRange = this.getLevelRange(userLevel);
        const templates = this.getTemplatesForLocation(location, userLevel);
        
        if (templates.length === 0) {
            // Fallback to basic enemy
            return this.generateBasicEnemy(userLevel);
        }

        const template = randomizer.getRandomElement(templates);
        return this.generateEnemyFromTemplate(template, userLevel, levelRange);
    }

    getLevelRange(userLevel) {
        // Enemies can be ±3 levels from user
        const minLevel = Math.max(1, userLevel - 3);
        const maxLevel = Math.min(100, userLevel + 3);
        return { min: minLevel, max: maxLevel };
    }

    getTemplatesForLocation(location, userLevel) {
        if (userLevel <= 15) {
            return enemyTemplates.eastBlue;
        } else if (userLevel <= 40) {
            return [...enemyTemplates.eastBlue, ...enemyTemplates.grandLine];
        } else if (userLevel <= 70) {
            return [...enemyTemplates.grandLine, ...enemyTemplates.newWorld];
        } else {
            return [...enemyTemplates.newWorld, ...enemyTemplates.endGame];
        }
    }

    generateEnemyFromTemplate(template, userLevel, levelRange) {
        const enemyLevel = randomizer.getRandomInt(levelRange.min, levelRange.max);
        const baseStats = this.calculateBaseStats(enemyLevel);

        // Apply template modifiers
        const health = Math.floor(baseStats.health * randomizer.getRandomFloat(template.healthRange[0], template.healthRange[1]));
        const attack = Math.floor(baseStats.attack * randomizer.getRandomFloat(template.attackRange[0], template.attackRange[1]));
        const defense = Math.floor(baseStats.defense * randomizer.getRandomFloat(template.defenseRange[0], template.defenseRange[1]));

        return {
            id: `enemy_${Date.now()}_${randomizer.getRandomInt(1000, 9999)}`,
            name: template.name,
            level: enemyLevel,
            health: health,
            maxHealth: health,
            attack: attack,
            defense: defense,
            type: template.type,
            description: template.description,
            baseTemplate: template.name
        };
    }

    generateBasicEnemy(userLevel) {
        const enemyLevel = Math.max(1, userLevel + randomizer.getRandomInt(-2, 3));
        const baseStats = this.calculateBaseStats(enemyLevel);

        const enemies = [
            'Rookie Pirate', 'Wild Bandit', 'Rogue Marine', 'Sea Beast',
            'Mountain Bandit', 'Corrupt Official', 'Bounty Hunter', 'Thug'
        ];

        return {
            id: `enemy_${Date.now()}_${randomizer.getRandomInt(1000, 9999)}`,
            name: randomizer.getRandomElement(enemies),
            level: enemyLevel,
            health: baseStats.health,
            maxHealth: baseStats.health,
            attack: baseStats.attack,
            defense: baseStats.defense,
            type: 'generic',
            description: 'A common enemy found throughout the seas.',
            baseTemplate: 'basic'
        };
    }

    calculateBaseStats(level) {
        const baseHealth = 80;
        const baseAttack = 15;
        const baseDefense = 8;

        return {
            health: baseHealth + (level * 12),
            attack: baseAttack + (level * 2.5),
            defense: baseDefense + (level * 1.5)
        };
    }

    getEnemiesByType(type) {
        const allEnemies = [
            ...enemyTemplates.eastBlue,
            ...enemyTemplates.grandLine,
            ...enemyTemplates.newWorld,
            ...enemyTemplates.endGame
        ];

        return allEnemies.filter(enemy => enemy.type === type);
    }

    getRandomBossEnemy(userLevel) {
        const bossTemplates = [
            {
                name: 'Buggy the Clown',
                baseLevel: 15,
                type: 'boss',
                description: 'The captain of the Buggy Pirates with the Bara Bara no Mi.',
                attackRange: [1.5, 1.8],
                healthRange: [2.0, 2.3],
                defenseRange: [1.2, 1.4]
            },
            {
                name: 'Arlong',
                baseLevel: 20,
                type: 'boss',
                description: 'The captain of the Arlong Pirates, a fierce sawshark fishman.',
                attackRange: [1.8, 2.1],
                healthRange: [2.2, 2.5],
                defenseRange: [1.4, 1.6]
            },
            {
                name: 'Crocodile',
                baseLevel: 45,
                type: 'warlord',
                description: 'Former Shichibukai with the Suna Suna no Mi.',
                attackRange: [2.2, 2.5],
                healthRange: [2.5, 2.8],
                defenseRange: [1.8, 2.0]
            },
            {
                name: 'Rob Lucci',
                baseLevel: 55,
                type: 'cp9',
                description: 'The strongest member of CP9 with the Neko Neko no Mi.',
                attackRange: [2.5, 2.8],
                healthRange: [2.3, 2.6],
                defenseRange: [2.0, 2.2]
            }
        ];

        const availableBosses = bossTemplates.filter(boss => userLevel >= boss.baseLevel - 5);
        if (availableBosses.length === 0) return this.generateBasicEnemy(userLevel);

        const boss = randomizer.getRandomElement(availableBosses);
        return this.generateEnemyFromTemplate(boss, userLevel, { min: userLevel, max: userLevel + 5 });
    }
}

// Create singleton instance
const enemySystem = new EnemySystem();

module.exports = enemySystem;
