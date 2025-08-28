const randomizer = require('../utils/randomizer.js');
const config = require('../config.js');
const enemies = require('../data/enemies.js');
const characters = require('../data/characters.js');
const locations = require('../data/locations.js');

class ExplorationSystem {
    constructor() {
        this.treasures = this.initializeTreasures();
    }

    initializeTreasures() {
        return [
            // Common treasures
            { name: 'Old Compass', value: 250, description: 'A weathered compass that still points true north.', rarity: 'common' },
            { name: 'Pirate\'s Journal', value: 400, description: 'A diary filled with tales of adventure and treasure maps.', rarity: 'common' },
            { name: 'Small Treasure Chest', value: 600, description: 'A wooden chest containing various small valuables.', rarity: 'common' },
            
            // Uncommon treasures
            { name: 'Golden Pocket Watch', value: 1200, description: 'An ornate golden watch that belonged to a wealthy merchant.', rarity: 'uncommon' },
            { name: 'Ancient Map Fragment', value: 1500, description: 'A piece of an ancient map showing mysterious islands.', rarity: 'uncommon' },
            { name: 'Silver Cutlass', value: 2000, description: 'A beautifully crafted silver cutlass in pristine condition.', rarity: 'uncommon' },
            
            // Rare treasures
            { name: 'Golden Skull', value: 5000, description: 'A skull made of pure gold, possibly from an ancient king.', rarity: 'rare' },
            { name: 'Poneglyph Rubbing', value: 8000, description: 'A rubbing from a mysterious Poneglyph stone.', rarity: 'rare' },
            { name: 'Ancient Devil Fruit Book', value: 12000, description: 'A tome containing knowledge about Devil Fruits.', rarity: 'rare' }
        ];
    }

    generateExploration(userData) {
        const currentLocation = userData.currentLocation || 'East Blue';
        const roll = randomizer.rollPercentage(100);

        // Determine exploration type based on percentages
        if (roll <= config.ENEMY_ENCOUNTER_CHANCE) {
            return this.generateEnemyEncounter(userData, currentLocation);
        } else if (roll <= config.ENEMY_ENCOUNTER_CHANCE + config.TREASURE_CHANCE) {
            return this.generateTreasureFind(userData, currentLocation);
        } else if (roll <= config.ENEMY_ENCOUNTER_CHANCE + config.TREASURE_CHANCE + config.ALLY_ENCOUNTER_CHANCE) {
            return this.generateAllyEncounter(userData, currentLocation);
        } else if (roll <= 85) { // 25% chance for new location
            return this.generateNewLocation(userData);
        } else {
            return this.generatePeacefulExploration(userData, currentLocation);
        }
    }

    generateEnemyEncounter(userData, location) {
        const enemy = enemies.generateEnemyForLevel(userData.level, location);
        
        return {
            type: 'enemy_encounter',
            location: location,
            enemy: enemy
        };
    }

    generateTreasureFind(userData, location) {
        const userLevel = userData.level;
        const availableTreasures = this.treasures.filter(treasure => {
            if (treasure.rarity === 'common') return true;
            if (treasure.rarity === 'uncommon') return userLevel >= 5;
            if (treasure.rarity === 'rare') return userLevel >= 15;
            return userLevel >= 30;
        });

        const treasure = randomizer.getRandomElement(availableTreasures);
        const levelMultiplier = 1 + (userLevel - 1) * 0.1;
        const adjustedValue = Math.floor(treasure.value * levelMultiplier);
        
        const expReward = Math.floor(adjustedValue / 15);

        return {
            type: 'treasure_found',
            location: location,
            treasure: {
                ...treasure,
                value: adjustedValue
            },
            expReward: expReward
        };
    }

    generateAllyEncounter(userData, location) {
        const ally = characters.getRandomCharacterForLocation(location, userData.level);
        const expReward = 30 + (userData.level * 5);
        const berryReward = 200 + (userData.level * 20);

        return {
            type: 'ally_encounter',
            location: location,
            ally: ally,
            expReward: expReward,
            berryReward: berryReward
        };
    }

    generateNewLocation(userData) {
        const newLocation = locations.getRandomLocationForLevel(userData.level);
        const expReward = 50 + (userData.level * 3);

        return {
            type: 'new_location',
            location: newLocation.name,
            description: newLocation.description,
            expReward: expReward
        };
    }

    generatePeacefulExploration(userData, location) {
        const expReward = 15 + randomizer.getRandomInt(5, 15);

        return {
            type: 'peaceful_exploration',
            location: location,
            expReward: expReward
        };
    }

    checkLevelUp(userData) {
        const expNeeded = Math.floor(config.BASE_EXP_REQUIREMENT * Math.pow(config.EXP_MULTIPLIER, userData.level - 1));
        
        if (userData.experience >= expNeeded && userData.level < config.MAX_LEVEL) {
            const oldLevel = userData.level;
            userData.level += 1;
            
            const healthGain = config.HEALTH_PER_LEVEL;
            const attackGain = config.ATTACK_PER_LEVEL;
            const defenseGain = config.DEFENSE_PER_LEVEL;

            userData.max_health += healthGain;
            userData.health = userData.max_health; // Full heal on level up
            userData.attack += attackGain;
            userData.defense += defenseGain;
            userData.experience = 0; // Reset for next level

            return {
                leveledUp: true,
                oldLevel: oldLevel,
                newLevel: userData.level,
                healthGain: healthGain,
                attackGain: attackGain,
                defenseGain: defenseGain,
                userData: userData
            };
        }

        return { leveledUp: false };
    }

    getLocationDanger(location, userLevel) {
        const locationData = locations.getLocationByName(location);
        if (!locationData) return 'unknown';

        if (userLevel < locationData.minLevel) return 'dangerous';
        if (userLevel > locationData.maxLevel + 10) return 'safe';
        return 'moderate';
    }
}

// Create singleton instance
const explorationSystem = new ExplorationSystem();

module.exports = explorationSystem;
