const devilFruits = require('../data/devilFruits.js');
const randomizer = require('../utils/randomizer.js');

class DevilFruitSystem {
    constructor() {
        this.devilFruits = devilFruits.getAllDevilFruits();
    }

    getRandomDevilFruit() {
        // Weight fruits by rarity
        const weightedFruits = [];
        
        this.devilFruits.forEach(fruit => {
            let weight = 1;
            switch (fruit.rarity) {
                case 'common': weight = 10; break;
                case 'uncommon': weight = 5; break;
                case 'rare': weight = 2; break;
                case 'epic': weight = 1; break;
                case 'mythical': weight = 0.5; break;
            }
            
            for (let i = 0; i < weight * 10; i++) {
                weightedFruits.push(fruit);
            }
        });

        return randomizer.getRandomElement(weightedFruits);
    }

    getDevilFruitByName(name) {
        return this.devilFruits.find(fruit => fruit.name.toLowerCase() === name.toLowerCase());
    }

    calculateStatBonus(devilFruit, powerLevel) {
        const baseBonus = this.getBaseBonusForRarity(devilFruit.rarity);
        const powerMultiplier = powerLevel / 100;

        return {
            attack: Math.floor(baseBonus.attack * powerMultiplier),
            defense: Math.floor(baseBonus.defense * powerMultiplier),
            health: Math.floor(baseBonus.health * powerMultiplier)
        };
    }

    getBaseBonusForRarity(rarity) {
        const bonuses = {
            'common': { attack: 20, defense: 15, health: 50 },
            'uncommon': { attack: 35, defense: 25, health: 75 },
            'rare': { attack: 50, defense: 40, health: 100 },
            'epic': { attack: 75, defense: 60, health: 150 },
            'mythical': { attack: 100, defense: 80, health: 200 }
        };

        return bonuses[rarity] || bonuses['common'];
    }

    trainDevilFruit(userData) {
        if (!userData.devilFruit) {
            return { success: false, error: 'No Devil Fruit to train' };
        }

        if (userData.devilFruitPower >= 100) {
            return { success: false, error: 'Power already at maximum' };
        }

        const currentLevel = userData.devilFruitPower;
        const successRate = this.calculateTrainingSuccessRate(currentLevel);
        
        const success = randomizer.rollPercentage(successRate);
        const previousLevel = currentLevel;

        if (success) {
            const powerGain = this.calculatePowerGain(currentLevel, userData.devilFruit.rarity);
            const newPowerLevel = Math.min(100, currentLevel + powerGain);
            
            // Calculate stat gains for the power increase
            const oldBonus = this.calculateStatBonus(userData.devilFruit, currentLevel);
            const newBonus = this.calculateStatBonus(userData.devilFruit, newPowerLevel);

            const statGains = {
                attack: newBonus.attack - oldBonus.attack,
                defense: newBonus.defense - oldBonus.defense,
                health: newBonus.health - oldBonus.health
            };

            return {
                success: true,
                previousLevel: previousLevel,
                newPowerLevel: newPowerLevel,
                statGains: statGains
            };
        } else {
            return {
                success: false,
                previousLevel: previousLevel,
                newPowerLevel: currentLevel,
                statGains: { attack: 0, defense: 0, health: 0 }
            };
        }
    }

    calculateTrainingSuccessRate(currentLevel) {
        // Success rate decreases as power level increases
        if (currentLevel < 25) return 80;
        if (currentLevel < 50) return 60;
        if (currentLevel < 75) return 40;
        if (currentLevel < 90) return 25;
        return 10; // Very hard to max out
    }

    calculatePowerGain(currentLevel, rarity) {
        let baseGain = 1;
        
        // Higher rarity fruits gain power faster
        switch (rarity) {
            case 'common': baseGain = 1; break;
            case 'uncommon': baseGain = 1.2; break;
            case 'rare': baseGain = 1.5; break;
            case 'epic': baseGain = 2; break;
            case 'mythical': baseGain = 2.5; break;
        }

        // Diminishing returns at higher levels
        if (currentLevel >= 80) baseGain *= 0.5;
        else if (currentLevel >= 60) baseGain *= 0.7;
        else if (currentLevel >= 40) baseGain *= 0.85;

        return Math.max(1, Math.floor(baseGain));
    }

    getSpecialAbilities(devilFruit, powerLevel) {
        if (!devilFruit.specialAbilities) return [];

        return devilFruit.specialAbilities.filter(ability => powerLevel >= ability.requiredLevel);
    }

    canUseSpecialAbility(userData, abilityName) {
        if (!userData.devilFruit) return false;

        const ability = userData.devilFruit.specialAbilities?.find(ab => ab.name === abilityName);
        if (!ability) return false;

        return userData.devilFruitPower >= ability.requiredLevel;
    }

    calculateSpecialDamage(userData, abilityName) {
        const ability = userData.devilFruit.specialAbilities?.find(ab => ab.name === abilityName);
        if (!ability) return 0;

        const baseDamage = userData.attack;
        const powerMultiplier = 1 + (userData.devilFruitPower / 100);
        const abilityMultiplier = ability.damageMultiplier || 1.5;

        return Math.floor(baseDamage * powerMultiplier * abilityMultiplier);
    }

    getDevilFruitsByType(type) {
        return this.devilFruits.filter(fruit => fruit.type.toLowerCase() === type.toLowerCase());
    }

    getDevilFruitsByRarity(rarity) {
        return this.devilFruits.filter(fruit => fruit.rarity.toLowerCase() === rarity.toLowerCase());
    }
}

// Create singleton instance
const devilFruitSystem = new DevilFruitSystem();

module.exports = devilFruitSystem;
