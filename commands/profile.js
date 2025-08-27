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
        
        const userData = await database.getUser(userId);
        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Pirate Not Found')
                .setDescription(`${targetUser.username} hasn't registered as a pirate yet! Use \`/register\` to begin the adventure.`);
                
            return await interaction.reply({ embeds: [embed] });
        }
        
        // Calculate experience needed for next level
        const expNeeded = Math.floor(config.BASE_EXP_REQUIREMENT * Math.pow(config.EXP_MULTIPLIER, (userData.level || 1) - 1));
        const expProgress = userData.experience || 0;
        const expPercentage = Math.min(100, (expProgress / expNeeded) * 100);
        
        // Create progress bar
        const progressBarLength = 10;
        const filledBars = Math.floor((expProgress / expNeeded) * progressBarLength);
        const emptyBars = progressBarLength - filledBars;
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
        
        // Crew information
        let crewInfo = 'None';
        if (userData.crew_id) {
            const crew = await database.getCrew(userData.crew_id);
            if (crew) {
                const roleEmoji = userData.crew_role === 'captain' ? '👑' : '⚓';
                crewInfo = `${roleEmoji} ${crew.name}`;
            }
        }
        
        // Devil Fruit information
        let devilFruitInfo = 'None';
        if (userData.devils_fruit) {
            devilFruitInfo = `${userData.devils_fruit.emoji} ${userData.devils_fruit.name}\n*Power Level: ${userData.devil_fruit_power || 0}*`;
        }
        
        // Ensure berries field exists and has a valid value
        const berries = userData.berries || 0;
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle(`🏴‍☠️ ${userData.username || 'Unknown'}'s Pirate Profile`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '⭐ Level', value: `${userData.level || 1}`, inline: true },
                { name: '❤️ Health', value: `${userData.health || 100}/${userData.max_health || 100}`, inline: true },
                { name: '💰 Berries', value: `₿${berries.toLocaleString()}`, inline: true },
                { name: '⚔️ Attack', value: `${userData.attack || 20}`, inline: true },
                { name: '🛡️ Defense', value: `${userData.defense || 10}`, inline: true },
                { name: '🗺️ Location', value: userData.current_location || 'East Blue', inline: true },
                { name: '📈 Experience', value: `${progressBar}\n${expProgress}/${expNeeded} XP (${expPercentage.toFixed(1)}%)` },
                { name: '👥 Crew', value: crewInfo, inline: true },
                { name: '🍎 Devil Fruit', value: devilFruitInfo, inline: true },
                { name: '🏆 Combat Record', value: `${userData.wins || 0}W - ${userData.losses || 0}L\n${userData.enemies_defeated || 0} enemies defeated`, inline: true }
            )
            .addFields(
                { name: '🗺️ Exploration Stats', value: `📍 ${(userData.locations_visited || []).length} locations visited\n🏴‍☠️ ${(userData.allies || []).length} allies found\n💎 ${userData.treasures_found || 0} treasures discovered` }
            )
            .setFooter({ text: `Pirate since ${new Date(userData.created_at || Date.now()).toDateString()}` })
            .setTimestamp();
            
        // Add equipment information if any
        const equipment = [];
        if (userData.equipment && userData.equipment.weapon) equipment.push(`⚔️ ${userData.equipment.weapon.name}`);
        if (userData.equipment && userData.equipment.armor) equipment.push(`🛡️ ${userData.equipment.armor.name}`);
        if (userData.equipment && userData.equipment.accessory) equipment.push(`💍 ${userData.equipment.accessory.name}`);
        
        if (equipment.length > 0) {
            embed.addFields({ name: '🎒 Equipment', value: equipment.join('\n') });
        }
            
        await interaction.reply({ embeds: [embed] });
    }
};
