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
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle(`🏴‍☠️ ${userData.username}'s Pirate Profile`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '⭐ Level', value: `${userData.level}`, inline: true },
                { name: '❤️ Health', value: `${userData.health}/${userData.maxHealth}`, inline: true },
                { name: '💰 Berries', value: `₿${userData.berries.toLocaleString()}`, inline: true },
                { name: '⚔️ Attack', value: `${userData.attack}`, inline: true },
                { name: '🛡️ Defense', value: `${userData.defense}`, inline: true },
                { name: '🗺️ Location', value: userData.currentLocation, inline: true }
            )
            .setFooter({ text: `Pirate since ${new Date(userData.createdAt).toDateString()}` })
            .setTimestamp();

        return embed;
    }

    // Combat status embed
    static combatStatus(combat, userData) {
        const userHealthPercent = (combat.userHealth / combat.userMaxHealth) * 100;
        const enemyHealthPercent = (combat.enemyHealth / combat.enemyMaxHealth) * 100;

        const userHealthBar = this.createHealthBar(userHealthPercent);
        const enemyHealthBar = this.createHealthBar(enemyHealthPercent);

        return new EmbedBuilder()
            .setColor(config.COLORS.COMBAT)
            .setTitle(`⚔️ Battle: ${userData.username} vs ${combat.enemy.name}`)
            .setDescription(`Current turn: ${combat.turn === 'user' ? '**Your Turn**' : '**Enemy Turn**'}`)
            .addFields(
                { name: `👤 ${userData.username} (Lv.${userData.level})`, value: `${userHealthBar}\n❤️ ${combat.userHealth}/${combat.userMaxHealth} HP`, inline: true },
                { name: `👹 ${combat.enemy.name} (Lv.${combat.enemy.level})`, value: `${enemyHealthBar}\n❤️ ${combat.enemyHealth}/${combat.enemyMaxHealth} HP`, inline: true },
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
        const affordable = userBerries >= item.price ? '✅' : '❌';
        const embed = new EmbedBuilder()
            .setColor(item.rarity === 'epic' ? config.COLORS.DEVIL_FRUIT : config.COLORS.PRIMARY)
            .setTitle(`${affordable} ${item.name}`)
            .setDescription(item.description)
            .addFields(
                { name: '💰 Price', value: `₿${item.price.toLocaleString()}`, inline: true },
                { name: '🏷️ Type', value: item.type, inline: true },
                { name: '⭐ Rarity', value: item.rarity, inline: true }
            );

        if (item.stats) {
            let statText = '';
            if (item.stats.attack > 0) statText += `⚔️ +${item.stats.attack} Attack\n`;
            if (item.stats.defense > 0) statText += `🛡️ +${item.stats.defense} Defense\n`;
            if (item.stats.health > 0) statText += `❤️ +${item.stats.health} Health\n`;
            
            if (statText) {
                embed.addFields({ name: '📈 Stats', value: statText, inline: true });
            }
        }

        return embed;
    }

    // Crew information embed
    static crewInfo(crew, members) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle(`🏴‍☠️ ${crew.name}`)
            .addFields(
                { name: '👑 Captain', value: members.find(m => m.role === 'captain')?.username || 'Unknown', inline: true },
                { name: '👥 Members', value: `${crew.members.length}`, inline: true },
                { name: '⭐ Level', value: `${crew.level}`, inline: true },
                { name: '🏆 Reputation', value: `${crew.reputation}`, inline: true },
                { name: '💰 Bounty', value: `₿${crew.bounty.toLocaleString()}`, inline: true },
                { name: '🗺️ Territories', value: `${crew.territories.length}`, inline: true }
            );

        if (members.length > 0) {
            const memberList = members.map(member => {
                const roleEmoji = member.role === 'captain' ? '👑' : '⚓';
                return `${roleEmoji} ${member.username} (Lv.${member.level})`;
            }).slice(0, 10).join('\n');

            embed.addFields({ name: '👥 Crew Roster', value: memberList || 'No members' });
        }

        embed.setFooter({ text: `Founded ${new Date(crew.createdAt).toDateString()}` });
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
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle('📦 Your Inventory')
            .setDescription(`You have ${items.length} items in your inventory.`)
            .addFields({ name: '💰 Berries', value: `₿${userData.berries.toLocaleString()}`, inline: true });

        if (items.length === 0) {
            embed.setDescription('Your inventory is empty! Visit the shop to buy items.');
            return embed;
        }

        // Group items by type
        const groupedItems = items.reduce((groups, item) => {
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
        return `₿${amount.toLocaleString()}`;
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
