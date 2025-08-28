const items = require('../data/items.js');
const randomizer = require('../utils/randomizer.js');

class EconomySystem {
    constructor() {
        this.shopItems = items.getShopItems();
    }

    getShopItems() {
        return this.shopItems;
    }

    getShopItem(itemId) {
        return this.shopItems.find(item => item.id === itemId);
    }

    buyItem(userData, item) {
        if (userData.berries < item.price) {
            return { success: false, error: 'Insufficient berries' };
        }

        // Deduct berries
        userData.berries -= item.price;

        // Add item to inventory
        if (!userData.inventory) userData.inventory = [];
        
        // Check if item already exists (for stackable items)
        const existingItem = userData.inventory.find(invItem => invItem.id === item.id);
        if (existingItem && item.stackable) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            const newItem = {
                ...item,
                quantity: 1,
                purchaseDate: new Date().toISOString()
            };
            userData.inventory.push(newItem);
        }

        // Auto-equip if it's equipment and slot is empty
        if (item.type === 'weapon' && !userData.equipment.weapon) {
            this.equipItem(userData, item);
        } else if (item.type === 'armor' && !userData.equipment.armor) {
            this.equipItem(userData, item);
        } else if (item.type === 'accessory' && !userData.equipment.accessory) {
            this.equipItem(userData, item);
        }

        return { success: true, userData: userData };
    }

    sellItem(userData, item) {
        if (!userData.inventory) {
            return { success: false, error: 'No inventory found' };
        }

        const inventoryIndex = userData.inventory.findIndex(invItem => invItem.id === item.id);
        if (inventoryIndex === -1) {
            return { success: false, error: 'Item not found in inventory' };
        }

        const sellPrice = Math.floor((item.sellPrice || item.price * 0.6));
        userData.berries += sellPrice;

        // Remove item from inventory
        const inventoryItem = userData.inventory[inventoryIndex];
        if (inventoryItem.quantity > 1) {
            inventoryItem.quantity -= 1;
        } else {
            userData.inventory.splice(inventoryIndex, 1);
            
            // Unequip if equipped
            if (userData.equipment.weapon && userData.equipment.weapon.id === item.id) {
                this.unequipItem(userData, 'weapon');
            } else if (userData.equipment.armor && userData.equipment.armor.id === item.id) {
                this.unequipItem(userData, 'armor');
            } else if (userData.equipment.accessory && userData.equipment.accessory.id === item.id) {
                this.unequipItem(userData, 'accessory');
            }
        }

        return { 
            success: true, 
            userData: userData,
            sellPrice: sellPrice
        };
    }

    equipItem(userData, item) {
        if (!item.stats) return { success: false, error: 'Item is not equippable' };

        const slot = item.type; // weapon, armor, accessory
        
        // Unequip current item if exists
        if (userData.equipment[slot]) {
            this.unequipItem(userData, slot);
        }

        // Equip new item
        userData.equipment[slot] = item;

        // Apply stat bonuses
        userData.attack += item.stats.attack || 0;
        userData.defense += item.stats.defense || 0;
        userData.max_health += item.stats.health || 0;
        userData.health = Math.min(userData.health + (item.stats.health || 0), userData.max_health);

        return { success: true, userData: userData };
    }

    unequipItem(userData, slot) {
        const item = userData.equipment[slot];
        if (!item) return { success: false, error: 'No item equipped in that slot' };

        // Remove stat bonuses
        userData.attack -= item.stats.attack || 0;
        userData.defense -= item.stats.defense || 0;
        userData.max_health -= item.stats.health || 0;
        userData.health = Math.min(userData.health, userData.max_health);

        // Remove from equipment
        userData.equipment[slot] = null;

        return { success: true, userData: userData, unequippedItem: item };
    }

    useConsumable(userData, item) {
        if (item.type !== 'consumable') {
            return { success: false, error: 'Item is not consumable' };
        }

        // Apply consumable effects
        const effects = item.effects || {};
        let healAmount = 0;

        if (effects.heal) {
            healAmount = Math.min(effects.heal, userData.max_health - userData.health);
            userData.health += healAmount;
        }

        if (effects.attack) {
            userData.attack += effects.attack;
        }

        if (effects.defense) {
            userData.defense += effects.defense;
        }

        // Remove item from inventory
        const inventoryIndex = userData.inventory.findIndex(invItem => invItem.id === item.id);
        if (inventoryIndex !== -1) {
            const inventoryItem = userData.inventory[inventoryIndex];
            if (inventoryItem.quantity > 1) {
                inventoryItem.quantity -= 1;
            } else {
                userData.inventory.splice(inventoryIndex, 1);
            }
        }

        return {
            success: true,
            userData: userData,
            effects: {
                heal: healAmount,
                ...effects
            }
        };
    }

    calculateNetWorth(userData) {
        let netWorth = userData.berries;

        // Add value of inventory items
        if (userData.inventory) {
            userData.inventory.forEach(item => {
                const itemValue = item.sellPrice || Math.floor(item.price * 0.6);
                netWorth += itemValue * (item.quantity || 1);
            });
        }

        // Add value of equipped items
        Object.values(userData.equipment).forEach(item => {
            if (item) {
                const itemValue = item.sellPrice || Math.floor(item.price * 0.6);
                netWorth += itemValue;
            }
        });

        return netWorth;
    }

    generateRandomDrop(enemyLevel, enemyType) {
        const dropChance = 15 + (enemyLevel * 0.5); // Base 15% + level scaling
        
        if (!randomizer.rollPercentage(dropChance)) {
            return null;
        }

        const possibleDrops = items.getDropsForEnemyType(enemyType, enemyLevel);
        if (possibleDrops.length === 0) return null;

        return randomizer.getRandomElement(possibleDrops);
    }

    applyInflation(userData) {
        // Simple inflation system - prices increase based on total wealth
        const netWorth = this.calculateNetWorth(userData);
        const inflationRate = Math.min(1.5, 1 + (netWorth / 1000000)); // Max 50% inflation
        
        return inflationRate;
    }
}

// Create singleton instance
const economySystem = new EconomySystem();

module.exports = economySystem;
