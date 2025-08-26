const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../database/database.js');
const config = require('../config.js');
const cooldowns = require('../utils/cooldowns.js');
const explorationSystem = require('../systems/explorationSystem.js');
const randomizer = require('../utils/randomizer.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Explore the Grand Line and discover new adventures!'),
        
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
        
        // Check cooldown
        if (cooldowns.isOnCooldown(userId, 'explore')) {
            const timeLeft = cooldowns.getTimeLeft(userId, 'explore');
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.WARNING)
                .setTitle('⏰ Still Sailing')
                .setDescription(`You're still exploring! You can explore again in **${Math.ceil(timeLeft / 1000)} seconds**.`);
            return await interaction.reply({ embeds: [embed] });
        }
        
        // Set cooldown
        cooldowns.setCooldown(userId, 'explore', config.EXPLORE_COOLDOWN);
        
        // Generate exploration event
        const explorationResult = explorationSystem.generateExploration(userData);
        
        let embed;
        let components = [];
        
        switch (explorationResult.type) {
            case 'enemy_encounter':
                embed = new EmbedBuilder()
                    .setColor(config.COLORS.COMBAT)
                    .setTitle('⚔️ Enemy Encounter!')
                    .setDescription(`While exploring **${explorationResult.location}**, you encountered a **${explorationResult.enemy.name}**!`)
                    .addFields(
                        { name: '🗺️ Location', value: explorationResult.location, inline: true },
                        { name: '👹 Enemy', value: explorationResult.enemy.name, inline: true },
                        { name: '⭐ Enemy Level', value: `${explorationResult.enemy.level}`, inline: true },
                        { name: '❤️ Enemy Health', value: `${explorationResult.enemy.health}`, inline: true },
                        { name: '⚔️ Enemy Attack', value: `${explorationResult.enemy.attack}`, inline: true },
                        { name: '🛡️ Enemy Defense', value: `${explorationResult.enemy.defense}`, inline: true }
                    )
                    .setFooter({ text: 'Choose your action wisely!' });
                    
                components = [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`combat_fight_${explorationResult.enemy.id}`)
                                .setLabel('⚔️ Fight')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('combat_flee')
                                .setLabel('🏃 Flee')
                                .setStyle(ButtonStyle.Secondary)
                        )
                ];
                break;
                
            case 'ally_encounter':
                // Add ally to user's collection
                userData.allies.push(explorationResult.ally);
                database.updateUser(userId, userData);
                
                embed = new EmbedBuilder()
                    .setColor(config.COLORS.SUCCESS)
                    .setTitle('🤝 Ally Discovered!')
                    .setDescription(`During your exploration of **${explorationResult.location}**, you met **${explorationResult.ally.name}**!`)
                    .addFields(
                        { name: '🗺️ Location', value: explorationResult.location, inline: true },
                        { name: '👑 Character', value: explorationResult.ally.name, inline: true },
                        { name: '🏴‍☠️ Affiliation', value: explorationResult.ally.affiliation, inline: true },
                        { name: '💬 Quote', value: `*"${explorationResult.ally.quote}"*` },
                        { name: '🎁 Reward', value: `You gained **${explorationResult.expReward} EXP** and **₿${explorationResult.berryReward}** for this encounter!` }
                    );
                    
                // Apply rewards
                userData.experience += explorationResult.expReward;
                userData.berries += explorationResult.berryReward;
                break;
                
            case 'treasure_found':
                userData.treasuresFound += 1;
                userData.berries += explorationResult.treasure.value;
                userData.experience += explorationResult.expReward;
                database.updateUser(userId, userData);
                
                embed = new EmbedBuilder()
                    .setColor(config.COLORS.TREASURE)
                    .setTitle('💎 Treasure Discovered!')
                    .setDescription(`You found a **${explorationResult.treasure.name}** while exploring **${explorationResult.location}**!`)
                    .addFields(
                        { name: '🗺️ Location', value: explorationResult.location, inline: true },
                        { name: '💎 Treasure', value: explorationResult.treasure.name, inline: true },
                        { name: '💰 Value', value: `₿${explorationResult.treasure.value.toLocaleString()}`, inline: true },
                        { name: '📜 Description', value: explorationResult.treasure.description },
                        { name: '🎁 Total Rewards', value: `**₿${explorationResult.treasure.value.toLocaleString()} Berries**\n**${explorationResult.expReward} EXP**` }
                    );
                break;
                
            case 'new_location':
                if (!userData.locationsVisited.includes(explorationResult.location)) {
                    userData.locationsVisited.push(explorationResult.location);
                    userData.experience += explorationResult.expReward;
                    database.updateUser(userId, userData);
                }
                
                embed = new EmbedBuilder()
                    .setColor(config.COLORS.PRIMARY)
                    .setTitle('🗺️ New Location Discovered!')
                    .setDescription(`You've discovered **${explorationResult.location}**!`)
                    .addFields(
                        { name: '🏝️ Location', value: explorationResult.location, inline: true },
                        { name: '🌊 Description', value: explorationResult.description },
                        { name: '🎁 Discovery Reward', value: `**${explorationResult.expReward} EXP**` }
                    );
                break;
                
            default: // peaceful_exploration
                embed = new EmbedBuilder()
                    .setColor(config.COLORS.PRIMARY)
                    .setTitle('🌊 Peaceful Exploration')
                    .setDescription(`You spent some time exploring **${explorationResult.location}** peacefully.`)
                    .addFields(
                        { name: '🗺️ Current Location', value: explorationResult.location, inline: true },
                        { name: '🌅 Experience', value: 'You gained some experience from your journey.', inline: true },
                        { name: '🎁 Small Reward', value: `**${explorationResult.expReward} EXP**` }
                    );
                    
                userData.experience += explorationResult.expReward;
                database.updateUser(userId, userData);
                break;
        }
        
        // Check for level up
        const levelUpResult = explorationSystem.checkLevelUp(userData);
        if (levelUpResult.leveledUp) {
            embed.addFields({
                name: '🎉 LEVEL UP!',
                value: `Congratulations! You reached **Level ${levelUpResult.newLevel}**!\n**+${levelUpResult.healthGain} Health**, **+${levelUpResult.attackGain} Attack**, **+${levelUpResult.defenseGain} Defense**`
            });
            
            database.updateUser(userId, levelUpResult.userData);
        }
        
        // Update last explore time
        userData.lastExplore = new Date().toISOString();
        userData.currentLocation = explorationResult.location;
        database.updateUser(userId, userData);
        
        const replyOptions = { embeds: [embed] };
        if (components.length > 0) {
            replyOptions.components = components;
        }
        
        await interaction.reply(replyOptions);
    }
};
