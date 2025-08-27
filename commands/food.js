const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../database/postgresDatabase.js');
const config = require('../config.js');
const items = require('../data/items.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('food')
        .setDescription('Manage your food and drinks')
        .addSubcommand(subcommand =>
            subcommand
                .setName('menu')
                .setDescription('Browse available food items by category')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('eat')
                .setDescription('Consume food from your inventory')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('The food item you want to eat')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('buffs')
                .setDescription('Check your active food buffs')
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const userData = database.getUser(userId);
        
        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Not Registered')
                .setDescription('You need to register first! Use `/register` to begin your pirate adventure.');
            return await interaction.reply({ embeds: [embed] });
        }

        const subcommand = interaction.options.getSubcommand();
        
        switch (subcommand) {
            case 'menu':
                await handleFoodMenu(interaction, userData);
                break;
            case 'eat':
                await handleEatFood(interaction, userData);
                break;
            case 'buffs':
                await handleFoodBuffs(interaction, userData);
                break;
        }
    },

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const userId = interaction.user.id;
        const userData = database.getUser(userId);
        
        if (!userData || !userData.inventory) {
            await interaction.respond([]);
            return;
        }

        // Get food items from user's inventory
        const foodItems = userData.inventory.filter(item => item.type === 'food');
        const filtered = foodItems.filter(item => 
            item.name.toLowerCase().includes(focusedValue.toLowerCase())
        ).slice(0, 25);
        
        await interaction.respond(
            filtered.map(item => ({
                name: `${item.name} (${item.quantity || 1})`,
                value: item.id
            }))
        );
    }
};

async function handleFoodMenu(interaction, userData) {
    const allItems = items.getShopItems();
    const foodItems = allItems.filter(item => item.type === 'food');
    
    // Group food by category
    const categories = {
        'meat': { name: '🥩 Meats', items: [] },
        'prepared_meal': { name: '🍽️ Prepared Meals', items: [] },
        'beverage': { name: '🍺 Beverages', items: [] },
        'fruit': { name: '🍎 Fruits', items: [] },
        'snack': { name: '🍪 Snacks', items: [] },
        'ingredient': { name: '🧂 Ingredients', items: [] }
    };
    
    foodItems.forEach(item => {
        const category = item.category || 'snack';
        if (categories[category]) {
            categories[category].items.push(item);
        }
    });
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle('🍖 Food & Drink Menu')
        .setDescription('Browse delicious food and drinks that provide temporary combat bonuses!')
        .addFields({ name: '💰 Your Berries', value: `₿${userData.berries.toLocaleString()}`, inline: true });
    
    Object.entries(categories).forEach(([key, category]) => {
        if (category.items.length === 0) return;
        
        const itemList = category.items.map(item => {
            const affordable = userData.berries >= item.price ? '✅' : '❌';
            const effects = [];
            if (item.effects.heal) effects.push(`+${item.effects.heal} HP`);
            if (item.effects.attack) effects.push(`+${item.effects.attack} ATK`);
            if (item.effects.defense) effects.push(`+${item.effects.defense} DEF`);
            
            const duration = item.duration ? `${Math.floor(item.duration / 60000)}min` : '';
            return `${affordable} **${item.name}** - ₿${item.price.toLocaleString()}\n${effects.join(', ')} ${duration ? `(${duration})` : ''}`;
        }).join('\n\n');
        
        embed.addFields({
            name: category.name,
            value: itemList.length > 1024 ? itemList.substring(0, 1021) + '...' : itemList,
            inline: false
        });
    });
    
    embed.setFooter({ text: 'Buy from /shop • Use /food eat to consume • Effects last for the shown duration' });
    
    await interaction.reply({ embeds: [embed] });
}

async function handleEatFood(interaction, userData) {
    const itemId = interaction.options.getString('item');
    
    // Find food item in user's inventory
    const foodItem = userData.inventory.find(item => item.id === itemId && item.type === 'food');
    
    if (!foodItem) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Food Not Found')
            .setDescription('You don\'t have that food item in your inventory.');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Clean up expired buffs first
    cleanupExpiredBuffs(userData);
    
    // Apply food effects
    const effects = foodItem.effects || {};
    let healAmount = 0;
    let results = [];
    
    if (effects.heal) {
        healAmount = Math.min(effects.heal, userData.maxHealth - userData.health);
        userData.health += healAmount;
        if (healAmount > 0) results.push(`Restored ${healAmount} health`);
    }
    
    // Add temporary buffs if duration is specified
    if (foodItem.duration) {
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
    const inventoryIndex = userData.inventory.findIndex(item => item.id === itemId);
    if (inventoryIndex !== -1) {
        if (userData.inventory[inventoryIndex].quantity > 1) {
            userData.inventory[inventoryIndex].quantity -= 1;
        } else {
            userData.inventory.splice(inventoryIndex, 1);
        }
    }
    
    // Update last food timestamp
    userData.lastFood = Date.now();
    
    // Save changes
    database.updateUser(interaction.user.id, userData);
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.SUCCESS)
        .setTitle('🍽️ Delicious!')
        .setDescription(`You enjoyed the **${foodItem.name}**!`)
        .addFields({
            name: '🎊 Effects',
            value: results.length > 0 ? results.join('\n') : 'No effects',
            inline: false
        });
    
    if (healAmount > 0) {
        embed.addFields({
            name: '❤️ Health',
            value: `${userData.health}/${userData.maxHealth} HP`,
            inline: true
        });
    }
    
    await interaction.reply({ embeds: [embed] });
}

async function handleFoodBuffs(interaction, userData) {
    // Clean up expired buffs
    cleanupExpiredBuffs(userData);
    
    if (!userData.activeFoodBuffs || userData.activeFoodBuffs.length === 0) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('🍽️ No Active Food Buffs')
            .setDescription('You don\'t have any active food buffs. Eat some food to gain temporary bonuses!')
            .addFields({
                name: '💡 Tip',
                value: 'Use `/food menu` to see available food and `/shop buy` to purchase them.',
                inline: false
            });
        return await interaction.reply({ embeds: [embed] });
    }
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.SUCCESS)
        .setTitle('🎊 Active Food Buffs')
        .setDescription('Your current temporary bonuses from food:');
    
    let totalAttack = 0;
    let totalDefense = 0;
    
    userData.activeFoodBuffs.forEach(buff => {
        const timeLeft = Math.max(0, buff.expiresAt - Date.now());
        const minutesLeft = Math.floor(timeLeft / 60000);
        const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
        
        let buffText = '';
        if (buff.attack !== 0) buffText += `${buff.attack > 0 ? '+' : ''}${buff.attack} Attack\n`;
        if (buff.defense !== 0) buffText += `${buff.defense > 0 ? '+' : ''}${buff.defense} Defense\n`;
        buffText += `⏱️ ${minutesLeft}:${secondsLeft.toString().padStart(2, '0')} remaining`;
        
        embed.addFields({
            name: `🍖 ${buff.name}`,
            value: buffText,
            inline: true
        });
        
        totalAttack += buff.attack;
        totalDefense += buff.defense;
    });
    
    // Show total bonuses
    let totalText = '';
    if (totalAttack !== 0) totalText += `${totalAttack > 0 ? '+' : ''}${totalAttack} Total Attack\n`;
    if (totalDefense !== 0) totalText += `${totalDefense > 0 ? '+' : ''}${totalDefense} Total Defense`;
    
    if (totalText) {
        embed.addFields({
            name: '📊 Total Bonuses',
            value: totalText,
            inline: false
        });
    }
    
    embed.setFooter({ text: 'Food buffs are temporary and will expire after their duration ends.' });
    
    await interaction.reply({ embeds: [embed] });
}

function cleanupExpiredBuffs(userData) {
    if (!userData.activeFoodBuffs) {
        userData.activeFoodBuffs = [];
        return;
    }
    
    const now = Date.now();
    userData.activeFoodBuffs = userData.activeFoodBuffs.filter(buff => buff.expiresAt > now);
}