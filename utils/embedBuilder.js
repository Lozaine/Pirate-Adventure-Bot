const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

class CustomEmbedBuilder {
    constructor() {
        this.embed = new EmbedBuilder();
    }

    // Quick preset methods
    static success(title, description) {
        return new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static error(title, description) {
        return new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static warning(title, description) {
        return new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle(`⚠️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static info(title, description) {
        return new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static combat(title, description) {
        return new EmbedBuilder()
            .setColor(config.COLORS.COMBAT)
            .setTitle(`⚔️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static treasure(title, description) {
        return new EmbedBuilder()
            .setColor(config.COLORS.TREASURE)
            .setTitle(`💎 ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static devilFruit(title, description) {
        return new EmbedBuilder()
            .setColor(config.COLORS.DEVIL_FRUIT)
            .setTitle(`🍎 ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    // Character profile embed
    static characterProfile(userData, targetUser) {
        // Ensure userData properties have default values to prevent NaN/undefined errors
        const safeUserData = {
            username: userData.username || 'Unknown',
            level: userData.level || 1,
            health: userData.health || 100,
            maxHealth: userData.maxHealth || 100,
            berries: userData.berries || 0,
            attack: userData.attack || 20,
            defense: userData.defense || 10,
            currentLocation: userData.currentLocation || 'East Blue',
            createdAt: userData.createdAt || new Date()
        };

        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle(`🏴‍☠️ ${safeUserData.username}'s Pirate Profile`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '⭐ Level', value: `${safeUserData.level}`, inline: true },
                { name: '❤️ Health', value: `${safeUserData.health}/${safeUserData.maxHealth}`, inline: true },
                { name: '💰 Berries', value: `₿${safeUserData.berries.toLocaleString()}`, inline: true },
                { name: '⚔️ Attack', value: `${safeUserData.attack}`, inline: true },
                { name: '🛡️ Defense', value: `${safeUserData.defense}`, inline: true },
                { name: '🗺️ Location', value: safeUserData.currentLocation, inline: true }
            )
            .setFooter({ text: `Pirate since ${new Date(safeUserData.createdAt).toDateString()}` })
            .setTimestamp();

        return embed;
    }

    // Combat status embed
    static combatStatus(combat, userData) {
        // Ensure combat data has default values to prevent NaN/undefined errors
        const safeCombat = {
            userHealth: combat.userHealth || 100,
            userMaxHealth: combat.userMaxHealth || 100,
            enemyHealth: combat.enemyHealth || 100,
            enemyMaxHealth: combat.enemyMaxHealth || 100,
            enemy: combat.enemy || { name: 'Unknown Enemy' },
            turn: combat.turn || 'user'
        };
        
        const userHealthPercent = (safeCombat.userHealth / safeCombat.userMaxHealth) * 100;
        const enemyHealthPercent = (safeCombat.enemyHealth / safeCombat.enemyMaxHealth) * 100;

        const userHealthBar = this.createHealthBar(userHealthPercent);
        const enemyHealthBar = this.createHealthBar(enemyHealthPercent);

        return new EmbedBuilder()
            .setColor(config.COLORS.COMBAT)
            .setTitle(`⚔️ Battle: ${userData.username || 'Unknown'} vs ${safeCombat.enemy.name}`)
            .setDescription(`Current turn: ${safeCombat.turn === 'user' ? '**Your Turn**' : '**Enemy Turn**'}`)
            .addFields(
                { name: `👤 ${userData.username || 'Unknown'} (Lv.${userData.level || 1})`, value: `${userHealthBar}\n❤️ ${safeCombat.userHealth}/${safeCombat.userMaxHealth} HP`, inline: true },
                { name: `👹 ${safeCombat.enemy.name} (Lv.${safeCombat.enemy.level || 1})`, value: `${enemyHealthBar}\n❤️ ${safeCombat.enemyHealth}/${safeCombat.enemyMaxHealth} HP`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }
            )
            .setTimestamp();
    }

    // Exploration result embed
    static explorationResult(result, userData) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle('🗺️ Exploration Result')
            .addFields(
                { name: '📍 Location', value: result.location, inline: true },
                { name: '🎲 Outcome', value: result.type.replace('_', ' '), inline: true }
            );

        if (result.description) {
            embed.setDescription(result.description);
        }

        return embed;
    }

    // Shop item embed
    static shopItem(item, userBerries) {
        // Ensure item and userBerries have default values to prevent NaN/undefined errors
        const safeItem = {
            name: item.name || 'Unknown Item',
            description: item.description || 'No description available',
            price: item.price || 0,
            type: item.type || 'material',
            rarity: item.rarity || 'common'
        };
        const safeBerries = userBerries || 0;
        
        const affordable = safeBerries >= safeItem.price ? '✅' : '❌';
        const embed = new EmbedBuilder()
            .setColor(safeItem.rarity === 'epic' ? config.COLORS.DEVIL_FRUIT : config.COLORS.PRIMARY)
            .setTitle(`${affordable} ${safeItem.name}`)
            .setDescription(safeItem.description)
            .addFields(
                { name: '💰 Price', value: `₿${safeItem.price.toLocaleString()}`, inline: true },
                { name: '🏷️ Type', value: safeItem.type, inline: true },
                { name: '⭐ Rarity', value: safeItem.rarity, inline: true }
            );

        if (safeItem.stats) {
            let statText = '';
            if (safeItem.stats.attack > 0) statText += `⚔️ +${safeItem.stats.attack} Attack\n`;
            if (safeItem.stats.defense > 0) statText += `🛡️ +${safeItem.stats.defense} Defense\n`;
            if (safeItem.stats.health > 0) statText += `❤️ +${safeItem.stats.health} Health\n`;
            
            if (statText) {
                embed.addFields({ name: '📈 Stats', value: statText, inline: true });
            }
        }

        return embed;
    }

    // Crew information embed
    static crewInfo(crew, members) {
        // Ensure crew and members have default values to prevent NaN/undefined errors
        const safeCrew = {
            name: crew.name || 'Unknown Crew',
            members: crew.members || [],
            level: crew.level || 1,
            reputation: crew.reputation || 0,
            bounty: crew.bounty || 0,
            territories: crew.territories || [],
            victories: crew.victories || 0,
            treasuresFound: crew.treasuresFound || 0,
            locationsDiscovered: crew.locationsDiscovered || [],
            createdAt: crew.createdAt || new Date()
        };
        const safeMembers = members || [];
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle(`🏴‍☠️ ${safeCrew.name}`)
            .addFields(
                { name: '👑 Captain', value: safeMembers.find(m => m.role === 'captain')?.username || 'Unknown', inline: true },
                { name: '👥 Members', value: `${safeCrew.members.length}`, inline: true },
                { name: '⭐ Level', value: `${safeCrew.level}`, inline: true },
                { name: '🏆 Reputation', value: `${safeCrew.reputation}`, inline: true },
                { name: '💰 Bounty', value: `₿${safeCrew.bounty.toLocaleString()}`, inline: true },
                { name: '🗺️ Territories', value: `${safeCrew.territories.length}`, inline: true }
            );

        if (safeMembers.length > 0) {
            const memberList = safeMembers.map(member => {
                const roleEmoji = member.role === 'captain' ? '👑' : '⚓';
                return `${roleEmoji} ${member.username} (Lv.${member.level})`;
            }).slice(0, 10).join('\n');

            embed.addFields({ name: '👥 Crew Roster', value: memberList || 'No members' });
        }

        embed.setFooter({ text: `Founded ${new Date(safeCrew.createdAt).toDateString()}` });
        return embed;
    }

    // Devil fruit information embed
    static devilFruitInfo(devilFruit, powerLevel) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.DEVIL_FRUIT)
            .setTitle(`🍎 ${devilFruit.name}`)
            .setDescription(devilFruit.description)
            .addFields(
                { name: '💫 Type', value: devilFruit.type, inline: true },
                { name: '⚡ Power Level', value: `${powerLevel}/100`, inline: true },
                { name: '🌟 Rarity', value: devilFruit.rarity, inline: true }
            );

        if (devilFruit.abilities && devilFruit.abilities.length > 0) {
            embed.addFields({
                name: '🔮 Abilities',
                value: devilFruit.abilities.slice(0, 3).join('\n')
            });
        }

        return embed;
    }

    // Level up notification embed
    static levelUp(oldLevel, newLevel, statGains) {
        return new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('🎉 LEVEL UP!')
            .setDescription(`Congratulations! You reached **Level ${newLevel}**!`)
            .addFields(
                { name: '📈 Level', value: `${oldLevel} → ${newLevel}`, inline: true },
                { name: '📊 Stat Gains', value: `**+${statGains.health}** Health\n**+${statGains.attack}** Attack\n**+${statGains.defense}** Defense`, inline: true }
            )
            .setTimestamp();
    }

    // Inventory display embed
    static inventory(userData, items) {
        // Ensure userData has default values to prevent NaN/undefined errors
        const safeUserData = {
            berries: userData.berries || 0
        };
        const safeItems = items || [];
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle('📦 Your Inventory')
            .setDescription(`You have ${safeItems.length} items in your inventory.`)
            .addFields({ name: '💰 Berries', value: `₿${safeUserData.berries.toLocaleString()}`, inline: true });

        if (safeItems.length === 0) {
            embed.setDescription('Your inventory is empty! Visit the shop to buy items.');
            return embed;
        }

        // Group items by type
        const groupedItems = safeItems.reduce((groups, item) => {
            const type = item.type || 'misc';
            if (!groups[type]) groups[type] = [];
            groups[type].push(item);
            return groups;
        }, {});

        // Add fields for each item type
        for (const [type, typeItems] of Object.entries(groupedItems)) {
            const typeEmoji = {
                weapon: '⚔️',
                armor: '🛡️',
                accessory: '💍',
                consumable: '🧪',
                tool: '🔧',
                material: '🧱',
                misc: '📦'
            };

            const itemList = typeItems.map(item => {
                const quantity = item.quantity > 1 ? ` (×${item.quantity})` : '';
                return `${item.name}${quantity}`;
            }).join('\n');

            embed.addFields({
                name: `${typeEmoji[type] || '📦'} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                value: itemList || 'None',
                inline: true
            });
        }

        return embed;
    }

    // Utility method to create health bars
    static createHealthBar(percentage) {
        const barLength = 10;
        const filledBars = Math.floor((percentage / 100) * barLength);
        const emptyBars = barLength - filledBars;
        
        let healthEmoji = '🟩';
        if (percentage < 25) healthEmoji = '🟥';
        else if (percentage < 50) healthEmoji = '🟨';
        
        return healthEmoji.repeat(filledBars) + '⬛'.repeat(emptyBars) + ` ${percentage.toFixed(1)}%`;
    }

    // Progress bar utility
    static createProgressBar(current, max, length = 10) {
        const percentage = Math.min(100, (current / max) * 100);
        const filledBars = Math.floor((percentage / 100) * length);
        const emptyBars = length - filledBars;
        
        return '█'.repeat(filledBars) + '░'.repeat(emptyBars) + ` ${percentage.toFixed(1)}%`;
    }

    // Cooldown display utility
    static formatCooldown(timeLeft) {
        const seconds = Math.ceil(timeLeft / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Rarity color helper
    static getRarityColor(rarity) {
        const colors = {
            common: 0x808080,      // Gray
            uncommon: 0x00ff00,    // Green
            rare: 0x0080ff,        // Blue
            epic: 0x8000ff,        // Purple
            mythical: 0xff8000,    // Orange
            legendary: 0xffd700    // Gold
        };
        return colors[rarity] || config.COLORS.PRIMARY;
    }

    // Format berries with proper thousands separators
    static formatBerries(amount) {
        // Ensure amount has a default value to prevent NaN/undefined errors
        const safeAmount = amount || 0;
        return `₿${safeAmount.toLocaleString()}`;
    }

    // Format large numbers with abbreviations
    static formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Generate field for embed with proper formatting
    static createField(name, value, inline = false) {
        return {
            name: name,
            value: value || '\u200B', // Zero width space if empty
            inline: inline
        };
    }

    // Create empty field for spacing
    static emptyField(inline = true) {
        return {
            name: '\u200B',
            value: '\u200B',
            inline: inline
        };
    }
}

module.exports = CustomEmbedBuilder;
