const devilFruits = [
    // Paramecia Type Fruits
    {
        id: 'gomu_gomu',
        name: 'Gomu Gomu no Mi',
        emoji: '🟣',
        type: 'Paramecia',
        rarity: 'epic',
        description: 'Grants the user\'s body the properties of rubber, making them immune to blunt attacks and electrical attacks.',
        abilities: [
            'Gomu Gomu no Pistol - Stretching punch attack',
            'Gomu Gomu no Gatling - Rapid fire punches',
            'Gear Second - Enhanced speed and power'
        ],
        specialAbilities: [
            { name: 'Gear Second', requiredLevel: 25, damageMultiplier: 1.8 },
            { name: 'Gear Third', requiredLevel: 50, damageMultiplier: 2.5 },
            { name: 'Gear Fourth', requiredLevel: 75, damageMultiplier: 3.2 }
        ]
    },
    {
        id: 'bara_bara',
        name: 'Bara Bara no Mi',
        emoji: '🔴',
        type: 'Paramecia',
        rarity: 'uncommon',
        description: 'Allows the user to split their body into pieces and control them independently.',
        abilities: [
            'Bara Bara Festival - Split body attacks',
            'Bara Bara Car - Spinning wheel attack'
        ]
    },
    {
        id: 'sube_sube',
        name: 'Sube Sube no Mi',
        emoji: '✨',
        type: 'Paramecia',
        rarity: 'common',
        description: 'Makes the user\'s skin smooth and slippery, causing attacks to slide off.',
        abilities: [
            'Perfect Defense - Reduced damage from physical attacks'
        ]
    },
    {
        id: 'mera_mera',
        name: 'Mera Mera no Mi',
        emoji: '🔥',
        type: 'Logia',
        rarity: 'rare',
        description: 'Allows the user to create, control, and transform into fire.',
        abilities: [
            'Fire Fist - Powerful fire punch',
            'Fire Pillar - Area fire attack',
            'Flame Emperor - Ultimate fire technique'
        ],
        specialAbilities: [
            { name: 'Fire Fist', requiredLevel: 20, damageMultiplier: 2.0 },
            { name: 'Flame Emperor', requiredLevel: 60, damageMultiplier: 3.0 }
        ]
    },
    {
        id: 'moku_moku',
        name: 'Moku Moku no Mi',
        emoji: '☁️',
        type: 'Logia',
        rarity: 'rare',
        description: 'Allows the user to create, control, and transform into smoke.',
        abilities: [
            'White Blow - Smoke punch attack',
            'Smoke Screen - Confuse enemies'
        ]
    },
    {
        id: 'suna_suna',
        name: 'Suna Suna no Mi',
        emoji: '🏜️',
        type: 'Logia',
        rarity: 'epic',
        description: 'Allows the user to create, control, and transform into sand.',
        abilities: [
            'Desert Spada - Sand blade attack',
            'Desert Grande Espada - Massive sand slash',
            'Desert La Spada - Ground cracking attack'
        ],
        specialAbilities: [
            { name: 'Desert Spada', requiredLevel: 15, damageMultiplier: 1.7 },
            { name: 'Desert La Spada', requiredLevel: 40, damageMultiplier: 2.8 }
        ]
    },
    {
        id: 'hito_hito',
        name: 'Hito Hito no Mi',
        emoji: '👤',
        type: 'Zoan',
        rarity: 'uncommon',
        description: 'Allows the user to transform into a human or human-hybrid.',
        abilities: [
            'Human Point - Increased intelligence',
            'Heavy Point - Increased strength and size'
        ]
    },
    {
        id: 'inu_inu_dachshund',
        name: 'Inu Inu no Mi, Model: Dachshund',
        emoji: '🐕',
        type: 'Zoan',
        rarity: 'common',
        description: 'Allows the user to transform into a dachshund or dachshund-hybrid.',
        abilities: [
            'Dog Form - Enhanced senses and speed'
        ]
    },
    {
        id: 'tori_tori_falcon',
        name: 'Tori Tori no Mi, Model: Falcon',
        emoji: '🦅',
        type: 'Zoan',
        rarity: 'uncommon',
        description: 'Allows the user to transform into a falcon or falcon-hybrid.',
        abilities: [
            'Falcon Form - Flight and enhanced vision',
            'Diving Attack - High-speed aerial strike'
        ]
    },
    {
        id: 'zou_zou',
        name: 'Zou Zou no Mi',
        emoji: '🐘',
        type: 'Zoan',
        rarity: 'rare',
        description: 'Allows the user to transform into an elephant or elephant-hybrid.',
        abilities: [
            'Elephant Form - Massive strength and weight',
            'Trunk Strike - Powerful trunk attack'
        ]
    },
    // Mythical Zoan
    {
        id: 'hito_hito_buddha',
        name: 'Hito Hito no Mi, Model: Daibutsu',
        emoji: '🙏',
        type: 'Mythical Zoan',
        rarity: 'mythical',
        description: 'Allows the user to transform into a golden Buddha, granting immense power and the ability to create shockwaves.',
        abilities: [
            'Buddha Form - Massive size and golden body',
            'Shockwave Palm - Devastating palm strike',
            'Buddha Impact - Ultimate shockwave attack'
        ],
        specialAbilities: [
            { name: 'Shockwave Palm', requiredLevel: 30, damageMultiplier: 2.5 },
            { name: 'Buddha Impact', requiredLevel: 70, damageMultiplier: 4.0 }
        ]
    },
    {
        id: 'tori_tori_phoenix',
        name: 'Tori Tori no Mi, Model: Phoenix',
        emoji: '🔥🦅',
        type: 'Mythical Zoan',
        rarity: 'mythical',
        description: 'Allows the user to transform into a phoenix, granting regeneration and blue flames.',
        abilities: [
            'Phoenix Form - Flight and regeneration',
            'Phoenix Talon - Blue flame attack',
            'Regeneration - Heal over time'
        ],
        specialAbilities: [
            { name: 'Phoenix Talon', requiredLevel: 25, damageMultiplier: 2.2 },
            { name: 'Full Regeneration', requiredLevel: 50, damageMultiplier: 0, healingMultiplier: 0.5 }
        ]
    },
    // More Paramecia fruits
    {
        id: 'bomu_bomu',
        name: 'Bomu Bomu no Mi',
        emoji: '💣',
        type: 'Paramecia',
        rarity: 'uncommon',
        description: 'Allows the user to make any part of their body explode.',
        abilities: [
            'Nose Fancy Cannon - Exploding booger attack',
            'Breeze Breath Bomb - Explosive breath'
        ]
    },
    {
        id: 'doru_doru',
        name: 'Doru Doru no Mi',
        emoji: '🕯️',
        type: 'Paramecia',
        rarity: 'common',
        description: 'Allows the user to create and control candle wax.',
        abilities: [
            'Candle Lock - Trap enemies in wax',
            'Candle Wall - Defensive wax barrier'
        ]
    },
    {
        id: 'baku_baku',
        name: 'Baku Baku no Mi',
        emoji: '🍽️',
        type: 'Paramecia',
        rarity: 'uncommon',
        description: 'Allows the user to eat anything and take on its properties.',
        abilities: [
            'Munch-Munch Factory - Transform body into weapons',
            'Baku Baku Cannon - Launch eaten objects'
        ]
    },
    {
        id: 'mane_mane',
        name: 'Mane Mane no Mi',
        emoji: '🎭',
        type: 'Paramecia',
        rarity: 'rare',
        description: 'Allows the user to transform into a physical copy of anyone they touch.',
        abilities: [
            'Clone Technique - Copy appearance and abilities',
            'Swan Dance - Combat while transformed'
        ]
    },
    {
        id: 'supa_supa',
        name: 'Supa Supa no Mi',
        emoji: '⚔️',
        type: 'Paramecia',
        rarity: 'uncommon',
        description: 'Allows the user to turn any part of their body into steel blades.',
        abilities: [
            'Dice Dice - Blade attacks',
            'Atomic Spurt - Ultra-fast blade strikes'
        ]
    },
    {
        id: 'toge_toge',
        name: 'Toge Toge no Mi',
        emoji: '🌵',
        type: 'Paramecia',
        rarity: 'common',
        description: 'Allows the user to grow spikes from any part of their body.',
        abilities: [
            'Spike Punch - Spiked fist attack',
            'Thorn Defense - Damage attackers on contact'
        ]
    },
    // Powerful Logia fruits
    {
        id: 'hie_hie',
        name: 'Hie Hie no Mi',
        emoji: '❄️',
        type: 'Logia',
        rarity: 'epic',
        description: 'Allows the user to create, control, and transform into ice.',
        abilities: [
            'Ice Age - Freeze large areas',
            'Ice Saber - Create ice weapons',
            'Ice Time - Freeze enemies solid'
        ],
        specialAbilities: [
            { name: 'Ice Saber', requiredLevel: 20, damageMultiplier: 1.9 },
            { name: 'Ice Age', requiredLevel: 45, damageMultiplier: 2.7 }
        ]
    },
    {
        id: 'pika_pika',
        name: 'Pika Pika no Mi',
        emoji: '💡',
        type: 'Logia',
        rarity: 'mythical',
        description: 'Allows the user to create, control, and transform into light.',
        abilities: [
            'Light Speed Kick - Ultra-fast light attack',
            'Yasakani Sacred Jewel - Light bullet barrage',
            'Light Sword - Blade of pure light'
        ],
        specialAbilities: [
            { name: 'Light Speed Kick', requiredLevel: 35, damageMultiplier: 3.0 },
            { name: 'Yasakani Sacred Jewel', requiredLevel: 60, damageMultiplier: 3.5 }
        ]
    },
    {
        id: 'magu_magu',
        name: 'Magu Magu no Mi',
        emoji: '🌋',
        type: 'Logia',
        rarity: 'mythical',
        description: 'Allows the user to create, control, and transform into magma.',
        abilities: [
            'Great Eruption - Massive magma fist',
            'Meteor Volcano - Rain of magma fists',
            'Lava Flow - Continuous magma attack'
        ],
        specialAbilities: [
            { name: 'Great Eruption', requiredLevel: 40, damageMultiplier: 3.2 },
            { name: 'Meteor Volcano', requiredLevel: 75, damageMultiplier: 4.5 }
        ]
    }
];

class DevilFruitSystem {
    getAllDevilFruits() {
        return devilFruits;
    }

    getDevilFruitById(id) {
        return devilFruits.find(fruit => fruit.id === id);
    }

    getDevilFruitsByType(type) {
        return devilFruits.filter(fruit => fruit.type === type);
    }

    getDevilFruitsByRarity(rarity) {
        return devilFruits.filter(fruit => fruit.rarity === rarity);
    }

    getRandomDevilFruit() {
        // Weighted random selection based on rarity
        const weights = {
            'common': 45,      // 45%
            'uncommon': 30,    // 30%
            'rare': 15,        // 15%
            'epic': 8,         // 8%
            'mythical': 2      // 2%
        };

        const weightedFruits = [];
        devilFruits.forEach(fruit => {
            const weight = weights[fruit.rarity] || 1;
            for (let i = 0; i < weight; i++) {
                weightedFruits.push(fruit);
            }
        });

        const randomIndex = Math.floor(Math.random() * weightedFruits.length);
        return weightedFruits[randomIndex];
    }

    getLogiaFruits() {
        return this.getDevilFruitsByType('Logia');
    }

    getParameciaFruits() {
        return this.getDevilFruitsByType('Paramecia');
    }

    getZoanFruits() {
        return devilFruits.filter(fruit => 
            fruit.type === 'Zoan' || fruit.type === 'Mythical Zoan'
        );
    }

    getMythicalFruits() {
        return devilFruits.filter(fruit => 
            fruit.rarity === 'mythical' || fruit.type === 'Mythical Zoan'
        );
    }

    getCanonicalFruits() {
        // Fruits that appear in the actual One Piece series
        const canonicalIds = [
            'gomu_gomu', 'bara_bara', 'sube_sube', 'mera_mera', 'moku_moku',
            'suna_suna', 'hito_hito', 'tori_tori_falcon', 'zou_zou',
            'hito_hito_buddha', 'tori_tori_phoenix', 'bomu_bomu', 'doru_doru',
            'baku_baku', 'mane_mane', 'supa_supa', 'toge_toge', 'hie_hie',
            'pika_pika', 'magu_magu'
        ];

        return devilFruits.filter(fruit => canonicalIds.includes(fruit.id));
    }

    searchFruitsByName(query) {
        const lowerQuery = query.toLowerCase();
        return devilFruits.filter(fruit => 
            fruit.name.toLowerCase().includes(lowerQuery) ||
            fruit.description.toLowerCase().includes(lowerQuery)
        );
    }
}

// Create singleton instance
const devilFruitSystem = new DevilFruitSystem();

module.exports = devilFruitSystem;
