const items = require('../data/items.js');
const randomizer = require('../utils/randomizer.js');

class FoodSystem {
    constructor() {
        this.foodCategories = {
            'meat': {
                name: '🥩 Meats',
                description: 'High-protein foods that boost attack power',
                primaryBonus: 'attack'
            },
            'prepared_meal': {
                name: '🍽️ Prepared Meals', 
                description: 'Balanced meals that provide multiple benefits',
                primaryBonus: 'balanced'
            },
            'beverage': {
                name: '🍺 Beverages',
                description: 'Drinks that provide quick energy and varied effects',
                primaryBonus: 'mixed'
            },
            'fruit': {
                name: '🍎 Fruits',
                description: 'Natural foods with unpredictable but potent effects',
                primaryBonus: 'special'
            },
            'snack': {
                name: '🍪 Snacks',
                description: 'Quick energy foods perfect for short adventures',
                primaryBonus: 'attack'
            },
            'ingredient': {
                name: '🧂 Ingredients',
                description: 'Raw materials that enhance other foods',
                primaryBonus: 'defense'
            }
        };
    }

    getFoodItems() {
        return items.getShopItems().filter(item => item.type === 'food');
    }

    getFoodByCategory(category) {
        return this.getFoodItems().filter(item => item.category === category);
    }

    getFoodCategories() {
        return this.foodCategories;
    }

    consumeFood(userData, foodItem) {
        if (foodItem.type !== 'food') {
            return { success: false, error: 'Item is not food' };
        }

        // Clean up expired buffs first
        this.cleanupExpiredBuffs(userData);

        const effects = foodItem.effects || {};
        let results = [];
        let healAmount = 0;

        // Apply immediate healing
        if (effects.heal) {
            healAmount = Math.min(effects.heal, userData.maxHealth - userData.health);
            userData.health += healAmount;
            if (healAmount > 0) results.push(`Restored ${healAmount} health`);
        }

        // Apply temporary buffs
        if (foodItem.duration && (effects.attack || effects.defense)) {
            const buffExpiry = Date.now() + foodItem.duration;
            const buff = {
                id: foodItem.id,
                name: foodItem.name,
                attack: effects.attack || 0,
                defense: effects.defense || 0,
                expiresAt: buffExpiry
            };

            // Remove existing buff of same type
            userData.activeFoodBuffs = userData.activeFoodBuffs.filter(b => b.id !== foodItem.id);
            userData.activeFoodBuffs.push(buff);

            if (effects.attack) results.push(`+${effects.attack} Attack (${Math.floor(foodItem.duration / 60000)} min)`);
            if (effects.defense) results.push(`+${effects.defense} Defense (${Math.floor(foodItem.duration / 60000)} min)`);
        }

        // Remove item from inventory
        const inventoryIndex = userData.inventory.findIndex(item => item.id === foodItem.id);
        if (inventoryIndex !== -1) {
            if (userData.inventory[inventoryIndex].quantity > 1) {
                userData.inventory[inventoryIndex].quantity -= 1;
            } else {
                userData.inventory.splice(inventoryIndex, 1);
            }
        }

        return {
            success: true,
            userData: userData,
            results: results,
            healAmount: healAmount
        };
    }

    getActiveFoodBuffs(userData) {
        this.cleanupExpiredBuffs(userData);
        return userData.activeFoodBuffs || [];
    }

    cleanupExpiredBuffs(userData) {
        if (!userData.activeFoodBuffs) {
            userData.activeFoodBuffs = [];
            return;
        }

        const now = Date.now();
        const originalLength = userData.activeFoodBuffs.length;
        userData.activeFoodBuffs = userData.activeFoodBuffs.filter(buff => buff.expiresAt > now);
        
        return userData.activeFoodBuffs.length < originalLength; // Return true if any buffs were removed
    }

    calculateFoodBonuses(userData) {
        const activeBuffs = this.getActiveFoodBuffs(userData);
        
        let totalAttack = 0;
        let totalDefense = 0;

        activeBuffs.forEach(buff => {
            totalAttack += buff.attack || 0;
            totalDefense += buff.defense || 0;
        });

        return {
            attack: totalAttack,
            defense: totalDefense
        };
    }

    getRecommendedFood(userData, situation = 'exploration') {
        const foodItems = this.getFoodItems();
        const affordable = foodItems.filter(item => item.price <= userData.berries);
        
        if (affordable.length === 0) return null;

        // Recommend based on situation
        if (situation === 'combat') {
            // Prioritize attack boosting foods
            const combatFood = affordable.filter(item => 
                item.effects.attack > 0 && item.level <= userData.level
            );
            return combatFood.length > 0 ? randomizer.getRandomElement(combatFood) : randomizer.getRandomElement(affordable);
        } else if (situation === 'healing') {
            // Prioritize healing foods
            const healingFood = affordable.filter(item => 
                item.effects.heal > 50 && item.level <= userData.level
            );
            return healingFood.length > 0 ? randomizer.getRandomElement(healingFood) : randomizer.getRandomElement(affordable);
        } else {
            // General exploration - balanced foods
            const balanced = affordable.filter(item => 
                item.effects.heal > 0 && (item.effects.attack > 0 || item.effects.defense > 0) && 
                item.level <= userData.level
            );
            return balanced.length > 0 ? randomizer.getRandomElement(balanced) : randomizer.getRandomElement(affordable);
        }
    }

    getFoodEffectDescription(food) {
        if (!food.effects) return 'No special effects';
        
        const effects = [];
        if (food.effects.heal) effects.push(`+${food.effects.heal} Health`);
        if (food.effects.attack) effects.push(`${food.effects.attack > 0 ? '+' : ''}${food.effects.attack} Attack`);
        if (food.effects.defense) effects.push(`${food.effects.defense > 0 ? '+' : ''}${food.effects.defense} Defense`);
        
        if (food.duration) {
            const duration = Math.floor(food.duration / 60000);
            effects.push(`Duration: ${duration} minutes`);
        }
        
        return effects.join(', ');
    }

    canEatFood(userData, foodItem) {
        if (!userData.inventory) return { canEat: false, reason: 'No inventory' };
        
        const hasItem = userData.inventory.find(item => item.id === foodItem.id && item.type === 'food');
        if (!hasItem) return { canEat: false, reason: 'Item not in inventory' };
        
        return { canEat: true };
    }

    generateRandomFoodDrop(enemyLevel, location) {
        const foodItems = this.getFoodItems();
        const levelAppropriate = foodItems.filter(item => 
            item.level <= enemyLevel + 5 && item.level >= Math.max(1, enemyLevel - 5)
        );
        
        if (levelAppropriate.length === 0) return null;
        
        const dropChance = 8; // 8% chance for food drop
        if (!randomizer.rollPercentage(dropChance)) return null;
        
        return randomizer.getRandomElement(levelAppropriate);
    }
}

// Create singleton instance
const foodSystem = new FoodSystem();

module.exports = foodSystem;