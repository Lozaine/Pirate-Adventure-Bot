const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../database/postgresDatabase.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your pirate profile and character stats')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('View another pirate\'s profile')
                .setRequired(false)
        ),
        
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userId = targetUser.id;
        
        const userData = database.getUser(userId);
        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Pirate Not Found')
                .setDescription(`${targetUser.username} hasn't registered as a pirate yet! Use \`/register\` to begin the adventure.`);
                
            return await interaction.reply({ embeds: [embed] });
        }
        
        // Calculate experience needed for next level
        const expNeeded = Math.floor(config.BASE_EXP_REQUIREMENT * Math.pow(config.EXP_MULTIPLIER, userData.level - 1));
        const expProgress = userData.experience;
        const expPercentage = Math.min(100, (expProgress / expNeeded) * 100);
        
        // Create progress bar
        const progressBarLength = 10;
        const filledBars = Math.floor((expProgress / expNeeded) * progressBarLength);
        const emptyBars = progressBarLength - filledBars;
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
        
        // Crew information
        let crewInfo = 'None';
        if (userData.crewId) {
            const crew = database.getCrew(userData.crewId);
            if (crew) {
                const roleEmoji = userData.crewRole === 'captain' ? '👑' : '⚓';
                crewInfo = `${roleEmoji} ${crew.name}`;
            }
        }
        
        // Devil Fruit information
        let devilFruitInfo = 'None';
        if (userData.devilFruit) {
            devilFruitInfo = `${userData.devilFruit.emoji} ${userData.devilFruit.name}\n*Power Level: ${userData.devilFruitPower}*`;
        }
        
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
                { name: '🗺️ Location', value: userData.currentLocation, inline: true },
                { name: '📈 Experience', value: `${progressBar}\n${expProgress}/${expNeeded} XP (${expPercentage.toFixed(1)}%)` },
                { name: '👥 Crew', value: crewInfo, inline: true },
                { name: '🍎 Devil Fruit', value: devilFruitInfo, inline: true },
                { name: '🏆 Combat Record', value: `${userData.wins}W - ${userData.losses}L\n${userData.enemiesDefeated} enemies defeated`, inline: true }
            )
            .addFields(
                { name: '🗺️ Exploration Stats', value: `📍 ${userData.locationsVisited.length} locations visited\n🏴‍☠️ ${userData.allies.length} allies found\n💎 ${userData.treasuresFound} treasures discovered` }
            )
            .setFooter({ text: `Pirate since ${new Date(userData.createdAt).toDateString()}` })
            .setTimestamp();
            
        // Add equipment information if any
        const equipment = [];
        if (userData.equipment.weapon) equipment.push(`⚔️ ${userData.equipment.weapon.name}`);
        if (userData.equipment.armor) equipment.push(`🛡️ ${userData.equipment.armor.name}`);
        if (userData.equipment.accessory) equipment.push(`💍 ${userData.equipment.accessory.name}`);
        
        if (equipment.length > 0) {
            embed.addFields({ name: '🎒 Equipment', value: equipment.join('\n') });
        }
            
        await interaction.reply({ embeds: [embed] });
    }
};
