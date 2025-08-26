class Randomizer {
    // Generate random integer between min and max (inclusive)
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate random float between min and max
    getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Roll percentage chance (0-100)
    rollPercentage(chance) {
        return Math.random() * 100 < chance;
    }

    // Get random element from array
    getRandomElement(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return null;
        }
        return array[Math.floor(Math.random() * array.length)];
    }

    // Get multiple random elements from array (without duplicates)
    getRandomElements(array, count) {
        if (!Array.isArray(array) || array.length === 0 || count <= 0) {
            return [];
        }

        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }

    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Weighted random selection
    getWeightedRandom(items, weights) {
        if (!Array.isArray(items) || !Array.isArray(weights) || items.length !== weights.length) {
            return null;
        }

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }

        return items[items.length - 1]; // Fallback
    }

    // Get random element based on rarity weights
    getRandomByRarity(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return null;
        }

        const rarityWeights = {
            'common': 50,
            'uncommon': 25,
            'rare': 15,
            'epic': 8,
            'mythical': 2,
            'legendary': 1
        };

        const weights = items.map(item => rarityWeights[item.rarity] || 1);
        return this.getWeightedRandom(items, weights);
    }

    // Generate random string
    generateRandomString(length = 8, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    // Generate random ID
    generateRandomId(prefix = '', length = 8) {
        const randomPart = this.generateRandomString(length, '0123456789abcdef');
        return prefix ? `${prefix}_${randomPart}` : randomPart;
    }

    // Generate UUID-like string
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Random boolean with custom probability
    randomBoolean(probability = 0.5) {
        return Math.random() < probability;
    }

    // Random choice with probabilities
    randomChoice(choices) {
        if (!Array.isArray(choices) || choices.length === 0) {
            return null;
        }

        // If choices are simple values, treat equally
        if (typeof choices[0] !== 'object') {
            return this.getRandomElement(choices);
        }

        // If choices have probability property
        const items = choices.map(choice => choice.value || choice);
        const weights = choices.map(choice => choice.probability || choice.weight || 1);
        
        return this.getWeightedRandom(items, weights);
    }

    // Generate random number with normal distribution
    randomNormal(mean = 0, stdDev = 1) {
        // Box-Muller transformation
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * stdDev + mean;
    }

    // Generate random number within range with bias towards center
    randomBiased(min, max, bias = 0.5) {
        const random1 = Math.random();
        const random2 = Math.random();
        const biasedRandom = random1 * bias + random2 * (1 - bias);
        return min + biasedRandom * (max - min);
    }

    // Dice rolling utilities
    rollDice(sides = 6, count = 1) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.getRandomInt(1, sides));
        }
        return {
            rolls: results,
            total: results.reduce((sum, roll) => sum + roll, 0),
            average: results.reduce((sum, roll) => sum + roll, 0) / results.length
        };
    }

    // Roll multiple dice with different sides
    rollMultipleDice(diceConfig) {
        const results = {};
        for (const [type, config] of Object.entries(diceConfig)) {
            const { sides = 6, count = 1 } = config;
            results[type] = this.rollDice(sides, count);
        }
        return results;
    }

    // Critical hit calculation
    rollCritical(baseDamage, critChance = 5, critMultiplier = 2) {
        const isCrit = this.rollPercentage(critChance);
        const damage = isCrit ? baseDamage * critMultiplier : baseDamage;
        
        return {
            damage: Math.floor(damage),
            isCritical: isCrit,
            multiplier: isCrit ? critMultiplier : 1
        };
    }

    // Random encounter generation
    generateRandomEncounter(encounterTable) {
        if (!Array.isArray(encounterTable) || encounterTable.length === 0) {
            return null;
        }

        const totalWeight = encounterTable.reduce((sum, encounter) => sum + (encounter.weight || 1), 0);
        let random = Math.random() * totalWeight;

        for (const encounter of encounterTable) {
            random -= (encounter.weight || 1);
            if (random <= 0) {
                return {
                    ...encounter,
                    rolled: true,
                    timestamp: Date.now()
                };
            }
        }

        return encounterTable[encounterTable.length - 1];
    }

    // Random stat generation
    generateRandomStats(baseStats, variance = 0.2) {
        const stats = {};
        for (const [stat, baseValue] of Object.entries(baseStats)) {
            const minValue = Math.floor(baseValue * (1 - variance));
            const maxValue = Math.floor(baseValue * (1 + variance));
            stats[stat] = this.getRandomInt(minValue, maxValue);
        }
        return stats;
    }

    // Random name generation (for NPCs, items, etc.)
    generateRandomName(type = 'default') {
        const nameParts = {
            pirate: {
                first: ['Red', 'Black', 'Iron', 'Storm', 'Sea', 'Thunder', 'Fire', 'Ice', 'Shadow', 'Golden'],
                last: ['Beard', 'Fist', 'Eye', 'Sword', 'Cannon', 'Devil', 'Shark', 'Wolf', 'Dragon', 'King']
            },
            marine: {
                first: ['Admiral', 'Captain', 'Commander', 'Vice', 'Rear', 'Fleet', 'Chief', 'Senior', 'Master', 'Grand'],
                last: ['Justice', 'Honor', 'Duty', 'Steel', 'Storm', 'Guard', 'Shield', 'Lance', 'Blade', 'Hammer']
            },
            island: {
                first: ['Sun', 'Moon', 'Star', 'Cloud', 'Wind', 'Storm', 'Fire', 'Ice', 'Green', 'Blue'],
                last: ['Island', 'Isle', 'Atoll', 'Key', 'Rock', 'Point', 'Bay', 'Harbor', 'Port', 'Cove']
            }
        };

        const parts = nameParts[type] || nameParts.default || nameParts.pirate;
        const firstName = this.getRandomElement(parts.first);
        const lastName = this.getRandomElement(parts.last);
        
        return `${firstName} ${lastName}`;
    }

    // Generate random treasure value based on level
    generateTreasureValue(level, baseValue = 100) {
        const levelMultiplier = 1 + (level * 0.1);
        const randomMultiplier = this.getRandomFloat(0.8, 1.5);
        return Math.floor(baseValue * levelMultiplier * randomMultiplier);
    }

    // Random event timing
    shouldEventOccur(probability, timeSinceLastEvent = 0, cooldownPeriod = 0) {
        if (timeSinceLastEvent < cooldownPeriod) {
            return false;
        }

        // Increase probability over time since last event
        const timeFactor = Math.min(2, 1 + (timeSinceLastEvent / cooldownPeriod));
        const adjustedProbability = probability * timeFactor;
        
        return this.rollPercentage(adjustedProbability);
    }

    // Seed-based random number generator for consistent results
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // Create seeded randomizer instance
    createSeededInstance(seed) {
        let currentSeed = seed;
        
        return {
            next: () => {
                currentSeed++;
                return this.seededRandom(currentSeed);
            },
            getRandomInt: (min, max) => {
                return Math.floor(this.seededRandom(++currentSeed) * (max - min + 1)) + min;
            },
            rollPercentage: (chance) => {
                return this.seededRandom(++currentSeed) * 100 < chance;
            }
        };
    }

    // Utility to test randomness quality
    testRandomness(iterations = 10000) {
        const results = new Array(10).fill(0);
        
        for (let i = 0; i < iterations; i++) {
            const bucket = Math.floor(Math.random() * 10);
            results[bucket]++;
        }

        const expected = iterations / 10;
        const chiSquare = results.reduce((sum, observed) => {
            const diff = observed - expected;
            return sum + (diff * diff) / expected;
        }, 0);

        return {
            results: results,
            expected: expected,
            chiSquare: chiSquare,
            isRandom: chiSquare < 16.92 // 95% confidence level for 9 degrees of freedom
        };
    }
}

// Create singleton instance
const randomizer = new Randomizer();

module.exports = randomizer;
