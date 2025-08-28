const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../database/postgresDatabase.js');
const config = require('../config.js');
const cooldowns = require('../utils/cooldowns.js');
const devilFruitSystem = require('../systems/devilFruitSystem.js');
const randomizer = require('../utils/randomizer.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devilfruit')
        .setDescription('Search for Devil Fruits or manage your current power')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for a Devil Fruit (rare chance to find one)')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('View information about your current Devil Fruit power')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('train')
                .setDescription('Train your Devil Fruit power to increase its effectiveness')
        ),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        const userData = await database.getUser(userId);
        
        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Not Registered')
                .setDescription('You need to register first! Use `/register` to begin your pirate adventure.');
            return await interaction.reply({ embeds: [embed] });
        }
        
        const subcommand = interaction.options.getSubcommand();
        
        switch (subcommand) {
            case 'search':
                await handleSearch(interaction, userData);
                break;
            case 'info':
                await handleInfo(interaction, userData);
                break;
            case 'train':
                await handleTrain(interaction, userData);
                break;
        }
    }
};

async function handleSearch(interaction, userData) {
    const userId = interaction.user.id;
    
    // Check cooldown
    if (cooldowns.isOnCooldown(userId, 'devil_fruit')) {
        const timeLeft = cooldowns.getTimeLeft(userId, 'devil_fruit');
        const minutes = Math.ceil(timeLeft / 60000);
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('⏰ Still Searching')
            .setDescription(`You've recently searched for Devil Fruits. You can search again in **${minutes} minutes**.`);
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Check if user already has a Devil Fruit
    if (userData.devil_fruit) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('🍎 Already Have Power')
            .setDescription(`You already possess the **${userData.devil_fruit.name}**! You cannot eat another Devil Fruit.`)
            .addFields(
                { name: '🍎 Current Fruit', value: `${userData.devil_fruit.emoji} ${userData.devil_fruit.name}` },
                { name: '⚡ Power Level', value: `${userData.devil_fruit_power}/100` },
                { name: '💫 Type', value: userData.devil_fruit.type }
            );
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Set cooldown
    cooldowns.setCooldown(userId, 'devil_fruit', config.DEVIL_FRUIT_COOLDOWN);
    
    // Roll for Devil Fruit
    const foundFruit = randomizer.rollPercentage(config.DEVIL_FRUIT_CHANCE);
    
    if (foundFruit) {
        const devilFruit = devilFruitSystem.getRandomDevilFruit();
        
        // Give Devil Fruit to user
        userData.devil_fruit = devilFruit;
        userData.devil_fruit_power = 1;
        
        // Apply initial stat bonuses
        const statBonus = devilFruitSystem.calculateStatBonus(devilFruit, 1);
        userData.attack += statBonus.attack;
        userData.defense += statBonus.defense;
        userData.max_health += statBonus.health;
        userData.health = userData.max_health; // Restore health when gaining fruit
        
        database.updateUser(userId, userData);
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.DEVIL_FRUIT)
            .setTitle('🍎 Devil Fruit Found!')
            .setDescription(`Incredible! You discovered and ate the **${devilFruit.name}**!`)
            .setThumbnail('https://i.imgur.com/devilfruit.png') // Placeholder
            .addFields(
                { name: '🍎 Devil Fruit', value: `${devilFruit.emoji} ${devilFruit.name}`, inline: true },
                { name: '💫 Type', value: devilFruit.type, inline: true },
                { name: '⚡ Starting Power', value: '1/100', inline: true },
                { name: '🔮 Ability', value: devilFruit.description },
                { name: '📈 Stat Bonuses', value: `**+${statBonus.attack}** Attack\n**+${statBonus.defense}** Defense\n**+${statBonus.health}** Health` },
                { name: '⚠️ Warning', value: 'You are now cursed by the sea! You cannot swim and are weakened by seawater.' }
            )
            .setFooter({ text: 'Use /devilfruit train to increase your power!' });
            
        await interaction.reply({ embeds: [embed] });
    } else {
        // No Devil Fruit found
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle('🔍 Devil Fruit Search')
            .setDescription('You searched far and wide but couldn\'t find any Devil Fruits this time.')
            .addFields(
                { name: '🗺️ Search Result', value: 'No Devil Fruits discovered' },
                { name: '🎁 Consolation Prize', value: 'You gained **25 EXP** and **₿500** for your efforts!' },
                { name: '🔄 Try Again', value: `You can search again in ${config.DEVIL_FRUIT_COOLDOWN / 60000} minutes.` }
            );
            
        // Give small consolation rewards
        userData.experience = (userData.experience || 0) + 25;
        userData.berries = (userData.berries || 0) + 500;
        database.updateUser(userId, userData);
        
        await interaction.reply({ embeds: [embed] });
    }
}

async function handleInfo(interaction, userData) {
    if (!userData.devil_fruit) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('🍎 No Devil Fruit')
            .setDescription('You haven\'t found a Devil Fruit yet! Use `/devilfruit search` to look for one.');
        return await interaction.reply({ embeds: [embed] });
    }
    
    const devilFruit = userData.devil_fruit;
    const powerLevel = userData.devil_fruit_power;
    const statBonus = devilFruitSystem.calculateStatBonus(devilFruit, powerLevel);
    const nextLevelBonus = devilFruitSystem.calculateStatBonus(devilFruit, Math.min(100, powerLevel + 1));
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.DEVIL_FRUIT)
        .setTitle(`🍎 ${devilFruit.name}`)
        .setDescription(devilFruit.description)
        .addFields(
            { name: '💫 Type', value: devilFruit.type, inline: true },
            { name: '⚡ Power Level', value: `${powerLevel}/100`, inline: true },
            { name: '🌟 Rarity', value: devilFruit.rarity, inline: true },
            { name: '📈 Current Bonuses', value: `**+${statBonus.attack}** Attack\n**+${statBonus.defense}** Defense\n**+${statBonus.health}** Max Health` },
            { name: '📊 Next Level Bonuses', value: powerLevel < 100 ? `**+${nextLevelBonus.attack}** Attack\n**+${nextLevelBonus.defense}** Defense\n**+${nextLevelBonus.health}** Max Health` : 'Already at maximum power!' }
        );
        
    if (devilFruit.abilities && devilFruit.abilities.length > 0) {
        embed.addFields({
            name: '🔮 Special Abilities',
            value: devilFruit.abilities.join('\n')
        });
    }
    
    embed.setFooter({ text: 'Use /devilfruit train to increase your power level!' });
    
    await interaction.reply({ embeds: [embed] });
}

async function handleTrain(interaction, userData) {
    if (!userData.devil_fruit) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('🍎 No Devil Fruit')
            .setDescription('You need a Devil Fruit power to train! Use `/devilfruit search` to find one.');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Ensure userData properties have default values to prevent NaN/undefined errors
    const devilFruitPower = userData.devil_fruit_power || 0;
    const berries = userData.berries || 0;
    const attack = userData.attack || 0;
    const defense = userData.defense || 0;
    const maxHealth = userData.max_health || 100;
    const health = userData.health || 100;
    
    if (devilFruitPower >= 100) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('⚡ Maximum Power')
            .setDescription('Your Devil Fruit power is already at maximum level (100/100)!');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Check if user has enough berries for training
    const trainingCost = devilFruitPower * 100 + 500;
    if (berries < trainingCost) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('💰 Insufficient Berries')
            .setDescription(`Training your Devil Fruit power costs **₿${trainingCost.toLocaleString()}**!\nYou only have **₿${berries.toLocaleString()}**.`);
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Perform training
    const trainingResult = devilFruitSystem.trainDevilFruit(userData);
    
    if (trainingResult.success) {
        userData.berries = berries - trainingCost;
        userData.devil_fruit_power = trainingResult.newPowerLevel;
        
        // Apply stat increases
        userData.attack = attack + trainingResult.statGains.attack;
        userData.defense = defense + trainingResult.statGains.defense;
        userData.max_health = maxHealth + trainingResult.statGains.health;
        userData.health = Math.min(health + trainingResult.statGains.health, userData.max_health);
        
        database.updateUser(interaction.user.id, userData);
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('⚡ Training Successful!')
            .setDescription(`Your ${userData.devil_fruit.name} power has grown stronger!`)
            .addFields(
                { name: '📈 Power Level', value: `${trainingResult.previousLevel} → ${trainingResult.newPowerLevel}`, inline: true },
                { name: '💰 Cost', value: `₿${trainingCost.toLocaleString()}`, inline: true },
                { name: '📊 Stat Gains', value: `**+${trainingResult.statGains.attack}** Attack\n**+${trainingResult.statGains.defense}** Defense\n**+${trainingResult.statGains.health}** Health` }
            );
            
        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Training Failed')
            .setDescription('Your training session didn\'t go as planned. Your power level remains the same, but you still paid for the training.')
            .addFields(
                { name: '💰 Cost', value: `₿${trainingCost.toLocaleString()}` },
                { name: '🎯 Current Level', value: `${devilFruitPower}/100` },
                { name: '💡 Tip', value: 'Training success rate increases with higher levels!' }
            );
            
        userData.berries = berries - trainingCost;
        database.updateUser(interaction.user.id, userData);
        
        await interaction.reply({ embeds: [embed] });
    }
}
