const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const database = require('../database/database.js');
const config = require('../config.js');
const economySystem = require('../systems/economySystem.js');
const items = require('../data/items.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Visit the merchant shop to buy items and equipment')
        .addSubcommand(subcommand =>
            subcommand
                .setName('browse')
                .setDescription('Browse available items in the shop')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('Buy an item from the shop')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('The item you want to buy')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sell')
                .setDescription('Sell items from your inventory')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('The item you want to sell')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventory')
                .setDescription('View your current inventory')
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
            case 'browse':
                await handleBrowse(interaction, userData);
                break;
            case 'buy':
                await handleBuy(interaction, userData);
                break;
            case 'sell':
                await handleSell(interaction, userData);
                break;
            case 'inventory':
                await handleInventory(interaction, userData);
                break;
        }
    },
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const userData = database.getUser(userId);
        
        if (subcommand === 'buy') {
            const shopItems = economySystem.getShopItems();
            const filtered = shopItems.filter(item => 
                item.name.toLowerCase().includes(focusedValue.toLowerCase())
            ).slice(0, 25);
            
            await interaction.respond(
                filtered.map(item => ({
                    name: `${item.name} - ₿${item.price.toLocaleString()}`,
                    value: item.id
                }))
            );
        } else if (subcommand === 'sell' && userData) {
            const userItems = userData.inventory || [];
            const filtered = userItems.filter(item => 
                item.name.toLowerCase().includes(focusedValue.toLowerCase())
            ).slice(0, 25);
            
            await interaction.respond(
                filtered.map(item => ({
                    name: `${item.name} (${item.quantity}) - ₿${Math.floor(item.sellPrice || item.price * 0.6)}`,
                    value: item.id
                }))
            );
        }
    }
};

async function handleBrowse(interaction, userData) {
    const shopItems = economySystem.getShopItems();
    const itemsPerPage = 8;
    const pages = Math.ceil(shopItems.length / itemsPerPage);
    const currentPage = 0;
    
    const embed = createShopEmbed(shopItems, currentPage, itemsPerPage, userData.berries);
    
    await interaction.reply({ embeds: [embed] });
}

async function handleBuy(interaction, userData) {
    const itemId = interaction.options.getString('item');
    const item = economySystem.getShopItem(itemId);
    
    if (!item) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Item Not Found')
            .setDescription('The item you\'re looking for is not available in the shop.');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Check if user has enough berries
    if (userData.berries < item.price) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('💰 Insufficient Berries')
            .setDescription(`You don't have enough berries to buy **${item.name}**!`)
            .addFields(
                { name: '💰 Price', value: `₿${item.price.toLocaleString()}`, inline: true },
                { name: '💳 Your Berries', value: `₿${userData.berries.toLocaleString()}`, inline: true },
                { name: '❌ Needed', value: `₿${(item.price - userData.berries).toLocaleString()}`, inline: true }
            );
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Process purchase
    const purchaseResult = economySystem.buyItem(userData, item);
    
    if (purchaseResult.success) {
        // Update user data
        database.updateUser(interaction.user.id, purchaseResult.userData);
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('✅ Purchase Successful!')
            .setDescription(`You successfully bought **${item.name}**!`)
            .addFields(
                { name: '🛒 Item', value: item.name, inline: true },
                { name: '💰 Price', value: `₿${item.price.toLocaleString()}`, inline: true },
                { name: '💳 Remaining Berries', value: `₿${purchaseResult.userData.berries.toLocaleString()}`, inline: true },
                { name: '📦 Description', value: item.description }
            );
            
        // Add stat bonuses if it's equipment
        if (item.type === 'equipment' && item.stats) {
            let statText = '';
            if (item.stats.attack > 0) statText += `+${item.stats.attack} Attack\n`;
            if (item.stats.defense > 0) statText += `+${item.stats.defense} Defense\n`;
            if (item.stats.health > 0) statText += `+${item.stats.health} Health\n`;
            
            if (statText) {
                embed.addFields({ name: '📈 Stat Bonuses', value: statText });
            }
        }
        
        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Purchase Failed')
            .setDescription(purchaseResult.error || 'Unable to complete the purchase.');
        await interaction.reply({ embeds: [embed] });
    }
}

async function handleSell(interaction, userData) {
    const itemId = interaction.options.getString('item');
    
    // Find item in user's inventory
    const inventoryItem = userData.inventory.find(item => item.id === itemId);
    
    if (!inventoryItem) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Item Not Found')
            .setDescription('You don\'t have that item in your inventory.');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Process sale
    const sellResult = economySystem.sellItem(userData, inventoryItem);
    
    if (sellResult.success) {
        // Update user data
        database.updateUser(interaction.user.id, sellResult.userData);
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('💰 Item Sold!')
            .setDescription(`You sold **${inventoryItem.name}** successfully!`)
            .addFields(
                { name: '🛒 Item', value: inventoryItem.name, inline: true },
                { name: '💰 Sale Price', value: `₿${sellResult.sellPrice.toLocaleString()}`, inline: true },
                { name: '💳 Total Berries', value: `₿${sellResult.userData.berries.toLocaleString()}`, inline: true }
            );
            
        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Sale Failed')
            .setDescription(sellResult.error || 'Unable to sell the item.');
        await interaction.reply({ embeds: [embed] });
    }
}

async function handleInventory(interaction, userData) {
    const inventory = userData.inventory || [];
    
    if (inventory.length === 0) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('📦 Empty Inventory')
            .setDescription('Your inventory is empty! Visit the shop to buy items.')
            .addFields(
                { name: '💰 Your Berries', value: `₿${userData.berries.toLocaleString()}` },
                { name: '🛒 Shop', value: 'Use `/shop browse` to see available items!' }
            );
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Group items by type
    const groupedItems = inventory.reduce((groups, item) => {
        const type = item.type || 'misc';
        if (!groups[type]) groups[type] = [];
        groups[type].push(item);
        return groups;
    }, {});
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle('📦 Your Inventory')
        .setDescription(`You have ${inventory.length} items in your inventory.`)
        .addFields({ name: '💰 Berries', value: `₿${userData.berries.toLocaleString()}`, inline: true });
    
    // Add fields for each item type
    for (const [type, items] of Object.entries(groupedItems)) {
        const typeEmoji = {
            weapon: '⚔️',
            armor: '🛡️',
            accessory: '💍',
            consumable: '🧪',
            misc: '📦'
        };
        
        const itemList = items.map(item => {
            const quantity = item.quantity > 1 ? ` (×${item.quantity})` : '';
            return `${item.name}${quantity}`;
        }).join('\n');
        
        embed.addFields({
            name: `${typeEmoji[type] || '📦'} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            value: itemList || 'None',
            inline: true
        });
    }
    
    embed.setFooter({ text: 'Use /shop sell to sell items for berries!' });
    
    await interaction.reply({ embeds: [embed] });
}

function createShopEmbed(shopItems, page, itemsPerPage, userBerries) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = shopItems.slice(start, end);
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle('🏪 Merchant Shop')
        .setDescription('Welcome to the Grand Line\'s finest merchant shop!')
        .addFields({ name: '💰 Your Berries', value: `₿${userBerries.toLocaleString()}`, inline: true });
    
    pageItems.forEach(item => {
        const affordable = userBerries >= item.price ? '✅' : '❌';
        embed.addFields({
            name: `${affordable} ${item.name}`,
            value: `**₿${item.price.toLocaleString()}**\n${item.description}`,
            inline: true
        });
    });
    
    embed.setFooter({ text: `Page ${page + 1}/${Math.ceil(shopItems.length / itemsPerPage)} • Use /shop buy <item> to purchase` });
    
    return embed;
}
