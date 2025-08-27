const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../database/postgresDatabase.js');
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
        const userData = await database.getUser(userId);
        
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
    const currentPage = 0; // Start with first category
    // Ensure berries field exists and has a valid value
    const berries = userData.berries || 0;
    const embed = createCategorizedShopEmbed(currentPage, berries);
    
    // Create navigation buttons - we have multiple categories
    const totalCategories = getShopCategories().length;
    let components = [];
    if (totalCategories > 1) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`shop_page_${Math.max(0, currentPage - 1)}`)
                    .setLabel('◀️ Previous')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId(`shop_page_${Math.min(totalCategories - 1, currentPage + 1)}`)
                    .setLabel('Next ▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalCategories - 1)
            );
        components.push(row);
    }
    
    await interaction.reply({ 
        embeds: [embed], 
        components: components 
    });
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
    
    // Ensure berries field exists and has a valid value
    const berries = userData.berries || 0;
    
    // Check if user has enough berries
    if (berries < item.price) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('💰 Insufficient Berries')
            .setDescription(`You don't have enough berries to buy **${item.name}**!`)
            .addFields(
                { name: '💰 Price', value: `₿${item.price.toLocaleString()}`, inline: true },
                { name: '💳 Your Berries', value: `₿${berries.toLocaleString()}`, inline: true },
                { name: '❌ Needed', value: `₿${(item.price - berries).toLocaleString()}`, inline: true }
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
                { name: '💳 Remaining Berries', value: `₿${(purchaseResult.userData.berries || 0).toLocaleString()}`, inline: true },
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
                { name: '💳 Total Berries', value: `₿${(sellResult.userData.berries || 0).toLocaleString()}`, inline: true }
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
            .setTitle('�� Empty Inventory')
            .setDescription('Your inventory is empty! Visit the shop to buy items.')
            .addFields(
                { name: '💰 Your Berries', value: `₿${(userData.berries || 0).toLocaleString()}` },
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
                    .addFields({ name: '💰 Berries', value: `₿${(userData.berries || 0).toLocaleString()}`, inline: true });
    
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

function getShopCategories() {
    return [
        { key: 'accessory', name: '💍 Accessories', description: 'Rings, bandanas, and special items that provide stat bonuses' },
        { key: 'weapon', name: '⚔️ Weapons', description: 'Swords, cutlasses, and other combat weapons' },
        { key: 'armor', name: '🛡️ Armor', description: 'Protective gear including vests, coats, and suits' },
        { key: 'food', name: '🍖 Food & Drink', description: 'Consumable items that provide healing and temporary buffs' },
        { key: 'consumable', name: '🧪 Consumables', description: 'Single-use items with various effects' },
        { key: 'tool', name: '🔧 Tools', description: 'Navigation and utility items for exploration' },
        { key: 'material', name: '💎 Materials', description: 'Rare materials and crafting components' }
    ];
}

function createCategorizedShopEmbed(categoryPage, userBerries) {
    const categories = getShopCategories();
    const currentCategory = categories[categoryPage];
    const shopItems = economySystem.getShopItems();
    
    // Get items for current category
    const categoryItems = shopItems.filter(item => {
        const itemType = item.type || 'material';
        return itemType === currentCategory.key;
    });
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle(`🏪 ${currentCategory.name}`)
        .setDescription(currentCategory.description)
        .addFields({ name: '💰 Your Berries', value: `₿${userBerries.toLocaleString()}`, inline: true });
    
    if (categoryItems.length === 0) {
        embed.addFields({
            name: '📦 No Items Available',
            value: 'This category is currently empty. Check back later!',
            inline: false
        });
    } else {
        // Add each item with full details
        categoryItems.forEach(item => {
            const affordable = userBerries >= item.price ? '✅' : '❌';
            let itemValue = `**₿${item.price.toLocaleString()}**\n${item.description}`;
            
            // Add stat bonuses if available
            if (item.stats) {
                let statText = '';
                if (item.stats.attack > 0) statText += `+${item.stats.attack} Attack `;
                if (item.stats.defense > 0) statText += `+${item.stats.defense} Defense `;
                if (item.stats.health > 0) statText += `+${item.stats.health} Health `;
                if (statText) itemValue += `\n📈 ${statText.trim()}`;
            }
            
            // Add food effects if available
            if (item.effects) {
                let effectText = '';
                if (item.effects.heal) effectText += `+${item.effects.heal} HP `;
                if (item.effects.attack) effectText += `+${item.effects.attack} ATK `;
                if (item.effects.defense) effectText += `+${item.effects.defense} DEF `;
                if (effectText && item.duration) {
                    const duration = Math.floor(item.duration / 60000);
                    effectText += `(${duration}min)`;
                }
                if (effectText) itemValue += `\n🎊 ${effectText.trim()}`;
            }
            
            // Add special properties
            if (item.special) {
                itemValue += `\n✨ ${item.special}`;
            }
            
            // Add rarity indicator
            const rarityEmojis = {
                'common': '⚪',
                'uncommon': '🟢', 
                'rare': '🔵',
                'epic': '🟣',
                'legendary': '🟡'
            };
            const rarityEmoji = rarityEmojis[item.rarity] || '⚪';
            
            embed.addFields({
                name: `${affordable} ${rarityEmoji} ${item.name}`,
                value: itemValue,
                inline: false
            });
        });
    }
    
    embed.setFooter({ 
        text: `Page ${categoryPage + 1}/${categories.length} • Use /shop buy <item> to purchase`
    });
    
    return embed;
}

function getItemTypeIcon(type) {
    const icons = {
        'weapon': '⚔️',
        'armor': '🛡️', 
        'accessory': '💍',
        'food': '🍖',
        'consumable': '🧪',
        'tool': '🔧',
        'material': '💎'
    };
    return icons[type] || '📦';
}
