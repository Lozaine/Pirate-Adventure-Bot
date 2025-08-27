const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../database/postgresDatabase.js');
const config = require('../config.js');
const cooldowns = require('../utils/cooldowns.js');
const randomizer = require('../utils/randomizer.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('treasure')
        .setDescription('Search for hidden treasures across the Grand Line'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        let userData = database.getUser(userId);
        
        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Not Registered')
                .setDescription('You need to register first! Use `/register` to begin your pirate adventure.');
            return await interaction.reply({ embeds: [embed] });
        }
        
        // Check cooldown
        if (cooldowns.isOnCooldown(userId, 'treasure')) {
            const timeLeft = cooldowns.getTimeLeft(userId, 'treasure');
            const minutes = Math.ceil(timeLeft / 60000);
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.WARNING)
                .setTitle('⏰ Still Searching')
                .setDescription(`You're still searching for treasure! You can hunt again in **${minutes} minutes**.`);
            return await interaction.reply({ embeds: [embed] });
        }
        
        // Set cooldown
        cooldowns.setCooldown(userId, 'treasure', config.TREASURE_COOLDOWN);
        
        // Generate treasure hunt result
        const treasureResult = generateTreasureHunt(userData);
        
        let embed;
        
        if (treasureResult.found) {
            // Treasure found!
            userData.treasuresFound += 1;
            userData.berries += treasureResult.berries;
            userData.experience += treasureResult.experience;
            
            // Add treasure item to inventory if it's equipment
            if (treasureResult.item) {
                if (!userData.inventory) userData.inventory = [];
                userData.inventory.push(treasureResult.item);
            }
            
            embed = new EmbedBuilder()
                .setColor(config.COLORS.TREASURE)
                .setTitle('💎 Treasure Found!')
                .setDescription(`You discovered **${treasureResult.treasure.name}** in **${userData.currentLocation}**!`)
                .addFields(
                    { name: '💰 Berries', value: `+₿${treasureResult.berries.toLocaleString()}`, inline: true },
                    { name: '⭐ Experience', value: `+${treasureResult.experience} EXP`, inline: true },
                    { name: '🗺️ Location', value: userData.currentLocation, inline: true },
                    { name: '📜 Description', value: treasureResult.treasure.description }
                );
                
            if (treasureResult.item) {
                embed.addFields({
                    name: '🎁 Special Item',
                    value: `You found **${treasureResult.item.name}**!\n*${treasureResult.item.description}*`
                });
            }
            
            // Check for level up
            const expNeeded = Math.floor(config.BASE_EXP_REQUIREMENT * Math.pow(config.EXP_MULTIPLIER, userData.level - 1));
            if (userData.experience >= expNeeded && userData.level < config.MAX_LEVEL) {
                const levelUpResult = levelUp(userData);
                embed.addFields({
                    name: '🎉 LEVEL UP!',
                    value: `Congratulations! You reached **Level ${levelUpResult.newLevel}**!\n**+${levelUpResult.healthGain} Health**, **+${levelUpResult.attackGain} Attack**, **+${levelUpResult.defenseGain} Defense**`
                });
                userData = levelUpResult.userData;
            }
        } else {
            // No treasure found
            const consolationExp = 10;
            userData.experience += consolationExp;
            
            embed = new EmbedBuilder()
                .setColor(config.COLORS.PRIMARY)
                .setTitle('🔍 Treasure Hunt')
                .setDescription(treasureResult.message)
                .addFields(
                    { name: '🗺️ Location Searched', value: userData.currentLocation, inline: true },
                    { name: '🎁 Consolation', value: `+${consolationExp} EXP`, inline: true },
                    { name: '💡 Tip', value: 'Try exploring different locations or come back later!' }
                );
        }
        
        // Update user data
        userData.lastTreasure = new Date().toISOString();
        database.updateUser(userId, userData);
        
        await interaction.reply({ embeds: [embed] });
    }
};

function generateTreasureHunt(userData) {
    const location = userData.currentLocation;
    const userLevel = userData.level;
    const treasureChance = config.TREASURE_CHANCE + (userLevel * 0.5); // Slightly better chances as level increases
    
    const found = randomizer.rollPercentage(Math.min(treasureChance, 30)); // Cap at 30% chance
    
    if (!found) {
        const failMessages = [
            'You searched high and low but found nothing but rocks and seashells.',
            'The treasure map led you to an empty chest - someone got here first!',
            'You dug several holes but only found sand and disappointment.',
            'The locals gave you false information about treasure in this area.',
            'You spent hours searching but the tide washed away any traces of treasure.',
            'Your treasure hunt was interrupted by local wildlife.',
            'The weather turned bad, forcing you to abandon your search.'
        ];
        
        return {
            found: false,
            message: randomizer.getRandomElement(failMessages)
        };
    }
    
    // Generate treasure based on user level and location
    const treasures = [
        // Common treasures (Level 1-10)
        { name: 'Rusty Compass', rarity: 'common', minLevel: 1, berries: [100, 300], description: 'An old compass that still points north... mostly.', hasItem: false },
        { name: 'Pirate\'s Coin Purse', rarity: 'common', minLevel: 1, berries: [200, 500], description: 'A small leather purse filled with forgotten coins.', hasItem: false },
        { name: 'Weathered Map Fragment', rarity: 'common', minLevel: 1, berries: [150, 400], description: 'A torn piece of what might have been a treasure map.', hasItem: false },
        { name: 'Seashell Collection', rarity: 'common', minLevel: 1, berries: [50, 200], description: 'Beautiful shells that collectors would pay for.', hasItem: false },
        
        // Uncommon treasures (Level 5-25)
        { name: 'Ornate Jewelry Box', rarity: 'uncommon', minLevel: 5, berries: [500, 1000], description: 'A beautiful box containing valuable jewelry.', hasItem: false },
        { name: 'Ancient Vase', rarity: 'uncommon', minLevel: 5, berries: [800, 1500], description: 'An ancient ceramic vase with intricate designs.', hasItem: false },
        { name: 'Pirate Captain\'s Hat', rarity: 'uncommon', minLevel: 8, berries: [600, 1200], description: 'A feathered hat that belonged to a famous pirate captain.', hasItem: true, itemType: 'accessory' },
        { name: 'Silver Cutlass', rarity: 'uncommon', minLevel: 10, berries: [1000, 2000], description: 'A gleaming silver cutlass in excellent condition.', hasItem: true, itemType: 'weapon' },
        
        // Rare treasures (Level 15-50)
        { name: 'Golden Idol', rarity: 'rare', minLevel: 15, berries: [2000, 4000], description: 'A solid gold idol from an ancient civilization.', hasItem: false },
        { name: 'Diamond Encrusted Dagger', rarity: 'rare', minLevel: 20, berries: [3000, 6000], description: 'A ceremonial dagger adorned with precious diamonds.', hasItem: true, itemType: 'weapon' },
        { name: 'Legendary Pirate\'s Chest', rarity: 'rare', minLevel: 25, berries: [5000, 10000], description: 'The personal treasure chest of a legendary pirate.', hasItem: false },
        { name: 'Marine Admiral\'s Sword', rarity: 'rare', minLevel: 30, berries: [4000, 8000], description: 'A high-quality sword that once belonged to a Marine Admiral.', hasItem: true, itemType: 'weapon' },
        
        // Epic treasures (Level 30+)
        { name: 'Ancient Devil Fruit Scroll', rarity: 'epic', minLevel: 30, berries: [8000, 15000], description: 'An ancient scroll containing knowledge about Devil Fruits.', hasItem: false },
        { name: 'Poneglyph Fragment', rarity: 'epic', minLevel: 40, berries: [10000, 20000], description: 'A piece of an ancient Poneglyph stone with mysterious writing.', hasItem: false },
        { name: 'One Piece Bounty Poster Collection', rarity: 'epic', minLevel: 35, berries: [12000, 25000], description: 'A complete collection of bounty posters from the most wanted pirates.', hasItem: false }
    ];
    
    // Filter treasures by user level
    const availableTreasures = treasures.filter(treasure => userData.level >= treasure.minLevel);
    const treasure = randomizer.getRandomElement(availableTreasures);
    
    // Calculate rewards
    const berryRange = treasure.berries;
    const berries = randomizer.getRandomInt(berryRange[0], berryRange[1]);
    const experienceBase = Math.floor(berries / 20); // Experience roughly scales with berries
    const experience = randomizer.getRandomInt(experienceBase, experienceBase * 2);
    
    let item = null;
    if (treasure.hasItem) {
        item = generateTreasureItem(treasure, userData.level);
    }
    
    return {
        found: true,
        treasure: treasure,
        berries: berries,
        experience: experience,
        item: item
    };
}

function generateTreasureItem(treasure, userLevel) {
    const itemTemplates = {
        weapon: {
            'Pirate Captain\'s Hat': { name: 'Captain\'s Feathered Hat', stats: { attack: 5, defense: 2 }, type: 'accessory' },
            'Silver Cutlass': { name: 'Gleaming Silver Cutlass', stats: { attack: 15, defense: 0 }, type: 'weapon' },
            'Diamond Encrusted Dagger': { name: 'Diamond Dagger', stats: { attack: 25, defense: 5 }, type: 'weapon' },
            'Marine Admiral\'s Sword': { name: 'Admiral\'s Ceremonial Sword', stats: { attack: 30, defense: 10 }, type: 'weapon' }
        }
    };
    
    const template = itemTemplates.weapon[treasure.name];
    if (!template) return null;
    
    // Scale item stats slightly with user level
    const levelBonus = Math.floor(userLevel / 10);
    
    return {
        id: `treasure_${treasure.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
        name: template.name,
        description: `A powerful ${template.type} discovered as treasure. ${treasure.description}`,
        type: template.type,
        rarity: treasure.rarity,
        stats: {
            attack: template.stats.attack + levelBonus,
            defense: template.stats.defense + levelBonus,
            health: template.stats.health || 0
        },
        sellPrice: Math.floor(treasure.berries[1] * 0.8),
        source: 'treasure'
    };
}

function levelUp(userData) {
    const oldLevel = userData.level;
    const newLevel = oldLevel + 1;
    
    // Calculate stat gains
    const healthGain = config.HEALTH_PER_LEVEL;
    const attackGain = config.ATTACK_PER_LEVEL;
    const defenseGain = config.DEFENSE_PER_LEVEL;
    
    // Update user stats
    userData.level = newLevel;
    userData.maxHealth += healthGain;
    userData.health = userData.maxHealth; // Full heal on level up
    userData.attack += attackGain;
    userData.defense += defenseGain;
    userData.experience = 0; // Reset experience for next level
    
    return {
        newLevel: newLevel,
        healthGain: healthGain,
        attackGain: attackGain,
        defenseGain: defenseGain,
        userData: userData
    };
}
