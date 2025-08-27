const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../database/postgresDatabase.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register as a new pirate and begin your One Piece adventure!'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Check if user already exists
        const existingUser = await database.getUser(userId);
        if (existingUser) {
            // Ensure berries field exists and has a valid value
            const berries = existingUser.berries || 0;
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.WARNING)
                .setTitle('⚠️ Already Registered')
                .setDescription('You are already registered as a pirate! Use `/profile` to view your character.')
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: '🏴‍☠️ Pirate Name', value: existingUser.username || 'Unknown', inline: true },
                    { name: '⭐ Level', value: `${existingUser.level || 1}`, inline: true },
                    { name: '💰 Berries', value: `₿${berries.toLocaleString()}`, inline: true }
                );
                
            return await interaction.reply({ embeds: [embed] });
        }
        
        // Create new user
        const newUser = await database.createUser(userId, username);
        
        if (!newUser) {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR || '#FF0000')
                .setTitle('❌ Registration Failed')
                .setDescription('Failed to create your pirate profile. Please try again later.')
                .setTimestamp();
            
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        
        // Ensure berries field exists and has a valid value
        const berries = newUser.berries || 1000;
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('🏴‍☠️ Welcome to the Grand Line!')
            .setDescription(`**${username}**, your pirate adventure begins now! You've awakened in the East Blue with dreams of finding the One Piece!`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: '⭐ Starting Level', value: '1', inline: true },
                { name: '❤️ Health', value: `${newUser.health || 100}/${newUser.max_health || 100}`, inline: true },
                { name: '💰 Starting Berries', value: `₿${berries.toLocaleString()}`, inline: true },
                { name: '⚔️ Attack Power', value: `${newUser.attack || 20}`, inline: true },
                { name: '🛡️ Defense', value: `${newUser.defense || 10}`, inline: true },
                { name: '🗺️ Current Location', value: newUser.current_location || 'East Blue', inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: '🎮 Getting Started', value: 'Use `/help` to see all available commands\nUse `/explore` to start your adventure\nUse `/profile` to check your stats' }
            )
            .setFooter({ text: 'The era of dreams begins! Set sail and find your crew!' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
