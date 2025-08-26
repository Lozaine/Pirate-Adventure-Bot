const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../database/database.js');
const config = require('../config.js');
const cooldowns = require('../utils/cooldowns.js');
const combatSystem = require('../systems/combatSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('combat')
        .setDescription('Engage in combat or check your current battle status'),
        
    async execute(interaction, client) {
        const userId = interaction.user.id;
        const userData = database.getUser(userId);
        
        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Not Registered')
                .setDescription('You need to register first! Use `/register` to begin your pirate adventure.');
            return await interaction.reply({ embeds: [embed] });
        }
        
        // Check if user has an active combat session
        const activeCombat = combatSystem.getActiveCombat(userId);
        
        if (activeCombat) {
            // Display current combat status
            const embed = combatSystem.createCombatEmbed(activeCombat, userData);
            const components = combatSystem.createCombatButtons(activeCombat);
            
            await interaction.reply({ 
                embeds: [embed], 
                components: components.length > 0 ? components : undefined 
            });
        } else {
            // No active combat - show combat history or initiate random encounter
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.PRIMARY)
                .setTitle('⚔️ Combat Status')
                .setDescription('You are not currently in combat.')
                .addFields(
                    { name: '🏆 Combat Record', value: `**${userData.wins}** Wins - **${userData.losses}** Losses`, inline: true },
                    { name: '👹 Enemies Defeated', value: `${userData.enemiesDefeated}`, inline: true },
                    { name: '🎯 Next Action', value: 'Use `/explore` to find enemies to battle!' }
                );
                
            await interaction.reply({ embeds: [embed] });
        }
    }
};
