const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../database/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register as a new pirate and begin your One Piece adventure!'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Check if user already exists
        const existingUser = database.getUser(userId);
        if (existingUser) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.WARNING)
                .setTitle('⚠️ Already Registered')
                .setDescription('You are already registered as a pirate! Use `/profile` to view your character.')
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: '🏴‍☠️ Pirate Name', value: existingUser.username, inline: true },
                    { name: '⭐ Level', value: `${existingUser.level}`, inline: true },
                    { name: '💰 Berries', value: `₿${existingUser.berries.toLocaleString()}`, inline: true }
                );
                
            return await interaction.reply({ embeds: [embed] });
        }
        
        // Create new user
        const newUser = database.createUser(userId, username);
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('🏴‍☠️ Welcome to the Grand Line!')
            .setDescription(`**${username}**, your pirate adventure begins now! You've awakened in the East Blue with dreams of finding the One Piece!`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: '⭐ Starting Level', value: '1', inline: true },
                { name: '❤️ Health', value: `${newUser.health}/${newUser.maxHealth}`, inline: true },
                { name: '💰 Starting Berries', value: `₿${newUser.berries.toLocaleString()}`, inline: true },
                { name: '⚔️ Attack Power', value: `${newUser.attack}`, inline: true },
                { name: '🛡️ Defense', value: `${newUser.defense}`, inline: true },
                { name: '🗺️ Current Location', value: newUser.currentLocation, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: '🎮 Getting Started', value: 'Use `/help` to see all available commands\nUse `/explore` to start your adventure\nUse `/profile` to check your stats' }
            )
            .setFooter({ text: 'The era of dreams begins! Set sail and find your crew!' })
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};
