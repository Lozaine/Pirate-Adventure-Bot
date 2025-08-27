const shopItems = [
    // Weapons
    {
        id: 'rusty_cutlass',
        name: 'Rusty Cutlass',
        description: 'An old cutlass that has seen better days, but still cuts true.',
        type: 'weapon',
        rarity: 'common',
        price: 500,
        sellPrice: 300,
        stats: { attack: 8, defense: 0, health: 0 },
        level: 1
    },
    {
        id: 'pirates_saber',
        name: 'Pirate\'s Saber',
        description: 'A curved blade favored by pirates for its balance and sharpness.',
        type: 'weapon',
        rarity: 'uncommon',
        price: 1200,
        sellPrice: 720,
        stats: { attack: 15, defense: 2, health: 0 },
        level: 5
    },
    {
        id: 'marine_sword',
        name: 'Marine Standard Sword',
        description: 'A well-crafted sword used by Marine officers.',
        type: 'weapon',
        rarity: 'uncommon',
        price: 1800,
        sellPrice: 1080,
        stats: { attack: 22, defense: 5, health: 0 },
        level: 10
    },
    {
        id: 'wado_ichimonji_replica',
        name: 'Wado Ichimonji Replica',
        description: 'A replica of the famous sword wielded by Roronoa Zoro.',
        type: 'weapon',
        rarity: 'rare',
        price: 5000,
        sellPrice: 3000,
        stats: { attack: 35, defense: 8, health: 10 },
        level: 20
    },
    {
        id: 'graded_sword',
        name: 'Graded Sword',
        description: 'A sword ranked among the 50 Skillful Grade swords.',
        type: 'weapon',
        rarity: 'epic',
        price: 15000,
        sellPrice: 9000,
        stats: { attack: 50, defense: 12, health: 20 },
        level: 35
    },

    // Armor
    {
        id: 'leather_vest',
        name: 'Leather Vest',
        description: 'Basic protection made from tough leather.',
        type: 'armor',
        rarity: 'common',
        price: 400,
        sellPrice: 240,
        stats: { attack: 0, defense: 10, health: 15 },
        level: 1
    },
    {
        id: 'reinforced_jacket',
        name: 'Reinforced Jacket',
        description: 'A jacket with metal studs for extra protection.',
        type: 'armor',
        rarity: 'uncommon',
        price: 1000,
        sellPrice: 600,
        stats: { attack: 0, defense: 18, health: 25 },
        level: 5
    },
    {
        id: 'marine_coat',
        name: 'Marine Justice Coat',
        description: 'The iconic white coat worn by Marine officers.',
        type: 'armor',
        rarity: 'rare',
        price: 3000,
        sellPrice: 1800,
        stats: { attack: 5, defense: 25, health: 40 },
        level: 15
    },
    {
        id: 'cp9_suit',
        name: 'CP9 Black Suit',
        description: 'A sleek black suit worn by government agents.',
        type: 'armor',
        rarity: 'epic',
        price: 8000,
        sellPrice: 4800,
        stats: { attack: 10, defense: 35, health: 60 },
        level: 30
    },

    // Accessories
    {
        id: 'pirates_bandana',
        name: 'Pirate\'s Bandana',
        description: 'A simple bandana that makes you look more intimidating.',
        type: 'accessory',
        rarity: 'common',
        price: 300,
        sellPrice: 180,
        stats: { attack: 3, defense: 3, health: 5 },
        level: 1
    },
    {
        id: 'lucky_coin',
        name: 'Lucky Coin',
        description: 'An old coin said to bring good fortune to its bearer.',
        type: 'accessory',
        rarity: 'uncommon',
        price: 800,
        sellPrice: 480,
        stats: { attack: 5, defense: 5, health: 10 },
        level: 3
    },
    {
        id: 'straw_hat',
        name: 'Straw Hat',
        description: 'A simple straw hat that reminds you of a certain pirate captain.',
        type: 'accessory',
        rarity: 'rare',
        price: 2500,
        sellPrice: 1500,
        stats: { attack: 8, defense: 8, health: 15 },
        level: 10
    },
    {
        id: 'vivre_card',
        name: 'Vivre Card',
        description: 'A special paper that points toward its creator.',
        type: 'accessory',
        rarity: 'epic',
        price: 7500,
        sellPrice: 4500,
        stats: { attack: 12, defense: 12, health: 25 },
        level: 25
    },

    // Consumables
    {
        id: 'meat_chunk',
        name: 'Chunk of Meat',
        description: 'A large piece of meat that restores health.',
        type: 'consumable',
        rarity: 'common',
        price: 100,
        sellPrice: 50,
        stackable: true,
        effects: { heal: 50 },
        level: 1
    },
    {
        id: 'energy_drink',
        name: 'Energy Drink',
        description: 'A fizzy drink that temporarily boosts your energy.',
        type: 'consumable',
        rarity: 'uncommon',
        price: 250,
        sellPrice: 150,
        stackable: true,
        effects: { heal: 100, attack: 5 },
        duration: 300000, // 5 minutes
        level: 5
    },
    {
        id: 'rumble_ball',
        name: 'Rumble Ball',
        description: 'A special drug that enhances Zoan transformations.',
        type: 'consumable',
        rarity: 'rare',
        price: 1000,
        sellPrice: 600,
        stackable: true,
        effects: { attack: 15, defense: 10 },
        duration: 180000, // 3 minutes
        level: 15
    },
    {
        id: 'hero_water',
        name: 'Hero Water',
        description: 'Legendary water that greatly enhances combat abilities.',
        type: 'consumable',
        rarity: 'epic',
        price: 5000,
        sellPrice: 3000,
        stackable: true,
        effects: { heal: 200, attack: 25, defense: 20 },
        duration: 600000, // 10 minutes
        level: 30
    },

    // Food Items
    {
        id: 'sea_king_meat',
        name: 'Sea King Meat',
        description: 'Massive chunk of meat from a Sea King. Restores health and boosts strength.',
        type: 'food',
        category: 'meat',
        rarity: 'epic',
        price: 800,
        sellPrice: 400,
        stackable: true,
        effects: { heal: 150, attack: 10 },
        duration: 1800000, // 30 minutes
        level: 20
    },
    {
        id: 'sanji_bento',
        name: 'Sanji Special Bento',
        description: 'A perfectly prepared meal that boosts all stats significantly.',
        type: 'food',
        category: 'prepared_meal',
        rarity: 'legendary',
        price: 2000,
        sellPrice: 1200,
        stackable: true,
        effects: { heal: 200, attack: 15, defense: 15 },
        duration: 3600000, // 1 hour
        level: 30
    },
    {
        id: 'cola',
        name: 'Cola',
        description: 'Refreshing drink that restores energy and provides a small speed boost.',
        type: 'food',
        category: 'beverage',
        rarity: 'common',
        price: 50,
        sellPrice: 25,
        stackable: true,
        effects: { heal: 25, attack: 2 },
        duration: 300000, // 5 minutes
        level: 1
    },
    {
        id: 'sake',
        name: 'Premium Sake',
        description: 'High-quality sake that boosts courage and fighting spirit.',
        type: 'food',
        category: 'beverage',
        rarity: 'uncommon',
        price: 200,
        sellPrice: 120,
        stackable: true,
        effects: { heal: 75, attack: 8, defense: -2 },
        duration: 900000, // 15 minutes
        level: 10
    },
    {
        id: 'milk',
        name: 'Fresh Milk',
        description: 'Nutritious milk that strengthens bones and boosts defense.',
        type: 'food',
        category: 'beverage',
        rarity: 'common',
        price: 75,
        sellPrice: 40,
        stackable: true,
        effects: { heal: 40, defense: 5 },
        duration: 600000, // 10 minutes
        level: 5
    },
    {
        id: 'ramen_bowl',
        name: 'Steaming Ramen Bowl',
        description: 'Hot, delicious ramen that warms the soul and restores vitality.',
        type: 'food',
        category: 'prepared_meal',
        rarity: 'uncommon',
        price: 300,
        sellPrice: 180,
        stackable: true,
        effects: { heal: 120, attack: 5, defense: 8 },
        duration: 1200000, // 20 minutes
        level: 15
    },
    {
        id: 'sea_salt',
        name: 'Sea Salt',
        description: 'Pure sea salt that enhances other foods and provides mineral boost.',
        type: 'food',
        category: 'ingredient',
        rarity: 'common',
        price: 25,
        sellPrice: 15,
        stackable: true,
        effects: { defense: 3 },
        duration: 1800000, // 30 minutes
        level: 1
    },
    {
        id: 'mystery_fruit',
        name: 'Mystery Fruit',
        description: 'A strange fruit with unknown effects. Could be beneficial or risky!',
        type: 'food',
        category: 'fruit',
        rarity: 'rare',
        price: 500,
        sellPrice: 300,
        stackable: true,
        effects: { heal: 100, attack: -5, defense: 15 }, // Mixed effects for mystery
        duration: 600000, // 10 minutes
        level: 12
    },
    {
        id: 'chef_special',
        name: 'Chef\'s Special Plate',
        description: 'An expertly crafted meal that provides exceptional nourishment.',
        type: 'food',
        category: 'prepared_meal',
        rarity: 'epic',
        price: 1200,
        sellPrice: 720,
        stackable: true,
        effects: { heal: 250, attack: 12, defense: 10 },
        duration: 2400000, // 40 minutes
        level: 25
    },
    {
        id: 'energy_bar',
        name: 'High-Energy Bar',
        description: 'Concentrated nutrition bar perfect for long adventures.',
        type: 'food',
        category: 'snack',
        rarity: 'uncommon',
        price: 150,
        sellPrice: 90,
        stackable: true,
        effects: { heal: 60, attack: 6 },
        duration: 900000, // 15 minutes
        level: 8
    },

    // Tools and Misc
    {
        id: 'log_pose',
        name: 'Log Pose',
        description: 'Essential navigation tool for the Grand Line.',
        type: 'tool',
        rarity: 'uncommon',
        price: 2000,
        sellPrice: 1200,
        stats: { attack: 0, defense: 0, health: 0 },
        special: 'Enables Grand Line exploration',
        level: 10
    },
    {
        id: 'eternal_pose',
        name: 'Eternal Pose',
        description: 'A Log Pose that points to a specific island forever.',
        type: 'tool',
        rarity: 'rare',
        price: 5000,
        sellPrice: 3000,
        stats: { attack: 0, defense: 0, health: 0 },
        special: 'Allows direct travel to known islands',
        level: 20
    },
    {
        id: 'den_den_mushi',
        name: 'Den Den Mushi',
        description: 'A snail used for long-distance communication.',
        type: 'tool',
        rarity: 'uncommon',
        price: 1500,
        sellPrice: 900,
        stats: { attack: 0, defense: 0, health: 0 },
        special: 'Enables crew communication',
        level: 5
    },
    {
        id: 'sea_prism_stone',
        name: 'Sea Prism Stone',
        description: 'A rare mineral that weakens Devil Fruit users.',
        type: 'material',
        rarity: 'epic',
        price: 10000,
        sellPrice: 6000,
        stats: { attack: 0, defense: 30, health: 0 },
        special: 'Nullifies Devil Fruit attacks',
        level: 40
    }
];

// Items that can drop from enemies
const enemyDrops = [
    // Common drops
    {
        id: 'pirate_bandana_drop',
        name: 'Worn Bandana',
        description: 'A bandana dropped by a defeated pirate.',
        type: 'accessory',
        rarity: 'common',
        sellPrice: 150,
        stats: { attack: 2, defense: 2, health: 3 },
        enemyTypes: ['pirate', 'bandit'],
        level: 1
    },
    {
        id: 'marine_badge',
        name: 'Marine Badge',
        description: 'An identification badge from a Marine soldier.',
        type: 'accessory',
        rarity: 'uncommon',
        sellPrice: 300,
        stats: { attack: 0, defense: 8, health: 5 },
        enemyTypes: ['marine'],
        level: 5
    },
    {
        id: 'broken_sword',
        name: 'Broken Sword',
        description: 'The remains of a sword from a fallen warrior.',
        type: 'material',
        rarity: 'common',
        sellPrice: 200,
        stats: { attack: 0, defense: 0, health: 0 },
        special: 'Can be used for crafting',
        enemyTypes: ['pirate', 'marine', 'swordsman'],
        level: 1
    },

    // Rare drops
    {
        id: 'devil_fruit_encyclopedia',
        name: 'Devil Fruit Encyclopedia Page',
        description: 'A torn page containing information about Devil Fruits.',
        type: 'material',
        rarity: 'rare',
        sellPrice: 1000,
        stats: { attack: 0, defense: 0, health: 0 },
        special: 'Increases Devil Fruit knowledge',
        enemyTypes: ['government', 'elite_pirate'],
        level: 20
    },
    {
        id: 'government_cipher',
        name: 'Government Cipher',
        description: 'An encrypted document from the World Government.',
        type: 'material',
        rarity: 'epic',
        sellPrice: 5000,
        stats: { attack: 0, defense: 0, health: 0 },
        special: 'Contains classified information',
        enemyTypes: ['government', 'cp9'],
        level: 30
    }
];

class ItemSystem {
    getShopItems() {
        return shopItems;
    }

    getShopItem(itemId) {
        return shopItems.find(item => item.id === itemId);
    }

    getItemsByType(type) {
        return shopItems.filter(item => item.type === type);
    }

    getItemsByRarity(rarity) {
        return shopItems.filter(item => item.rarity === rarity);
    }

    getItemsByLevel(level, range = 10) {
        return shopItems.filter(item => 
            item.level <= level && item.level >= level - range
        );
    }

    getWeapons() {
        return this.getItemsByType('weapon');
    }

    getArmor() {
        return this.getItemsByType('armor');
    }

    getAccessories() {
        return this.getItemsByType('accessory');
    }

    getConsumables() {
        return this.getItemsByType('consumable');
    }

    getDropsForEnemyType(enemyType, enemyLevel) {
        return enemyDrops.filter(item => 
            item.enemyTypes.includes(enemyType) && 
            item.level <= enemyLevel + 5
        );
    }

    getAllDrops() {
        return enemyDrops;
    }

    searchItems(query) {
        const lowerQuery = query.toLowerCase();
        return shopItems.filter(item =>
            item.name.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.type.toLowerCase().includes(lowerQuery)
        );
    }

    getItemValue(item) {
        return item.sellPrice || Math.floor(item.price * 0.6);
    }

    getItemsByPriceRange(minPrice, maxPrice) {
        return shopItems.filter(item => 
            item.price >= minPrice && item.price <= maxPrice
        );
    }

    getAffordableItems(berries) {
        return shopItems.filter(item => item.price <= berries);
    }

    getItemUpgrades(currentItem, userLevel) {
        if (!currentItem || currentItem.type === 'consumable') return [];

        return shopItems.filter(item => 
            item.type === currentItem.type &&
            item.level <= userLevel &&
            this.isItemBetter(item, currentItem)
        );
    }

    isItemBetter(newItem, currentItem) {
        if (!newItem.stats || !currentItem.stats) return false;

        const newTotal = (newItem.stats.attack || 0) + (newItem.stats.defense || 0) + (newItem.stats.health || 0);
        const currentTotal = (currentItem.stats.attack || 0) + (currentItem.stats.defense || 0) + (currentItem.stats.health || 0);

        return newTotal > currentTotal;
    }

    getRandomShopItem(rarity = null) {
        let items = shopItems;
        
        if (rarity) {
            items = items.filter(item => item.rarity === rarity);
        }

        if (items.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * items.length);
        return items[randomIndex];
    }

    getStarterGear() {
        return {
            weapon: this.getShopItem('rusty_cutlass'),
            armor: this.getShopItem('leather_vest'),
            accessory: this.getShopItem('pirates_bandana')
        };
    }

    getEndGameGear() {
        return shopItems.filter(item => 
            item.level >= 30 && 
            ['weapon', 'armor', 'accessory'].includes(item.type)
        );
    }
}

// Create singleton instance
const itemSystem = new ItemSystem();

module.exports = itemSystem;
