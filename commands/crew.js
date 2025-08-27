const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../database/postgresDatabase.js');
const config = require('../config.js');
const crewSystem = require('../systems/crewSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crew')
        .setDescription('Manage your pirate crew')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new pirate crew')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name for your crew')
                        .setRequired(true)
                        .setMaxLength(50)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('View information about your crew or another crew')
                .addStringOption(option =>
                    option.setName('crew')
                        .setDescription('Name of the crew to view')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('invite')
                .setDescription('Invite a pirate to join your crew')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The pirate to invite')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Join a crew (if you have an invitation)')
                .addStringOption(option =>
                    option.setName('crew')
                        .setDescription('Name of the crew to join')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('Leave your current crew')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Kick a member from your crew (captain only)')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The member to kick')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all active crews')
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
            case 'create':
                await handleCreate(interaction, userData);
                break;
            case 'info':
                await handleInfo(interaction, userData);
                break;
            case 'invite':
                await handleInvite(interaction, userData);
                break;
            case 'join':
                await handleJoin(interaction, userData);
                break;
            case 'leave':
                await handleLeave(interaction, userData);
                break;
            case 'kick':
                await handleKick(interaction, userData);
                break;
            case 'list':
                await handleList(interaction, userData);
                break;
        }
    }
};

async function handleCreate(interaction, userData) {
    const crewName = interaction.options.getString('name');
    const userId = interaction.user.id;
    
    // Check if user is already in a crew
    if (userData.crewId) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('⚓ Already in Crew')
            .setDescription('You\'re already part of a crew! You need to leave your current crew before creating a new one.');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Check if crew name already exists
    const existingCrew = crewSystem.findCrewByName(crewName);
    if (existingCrew) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Name Taken')
            .setDescription(`A crew named **${crewName}** already exists! Please choose a different name.`);
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Create the crew
    const crewResult = crewSystem.createCrew(crewName, userId, userData);
    
    if (crewResult.success) {
        // Update user data
        userData.crewId = crewResult.crew.id;
        userData.crewRole = 'captain';
        database.updateUser(userId, userData);
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('🏴‍☠️ Crew Created!')
            .setDescription(`Congratulations! You've founded the **${crewName}** crew!`)
            .addFields(
                { name: '👑 Captain', value: userData.username, inline: true },
                { name: '⚓ Crew Name', value: crewName, inline: true },
                { name: '👥 Members', value: '1', inline: true },
                { name: '🎯 Next Steps', value: 'Use `/crew invite @user` to recruit crew members!' }
            )
            .setFooter({ text: 'Lead your crew to glory on the Grand Line!' });
            
        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Creation Failed')
            .setDescription(crewResult.error || 'Failed to create the crew.');
        await interaction.reply({ embeds: [embed] });
    }
}

async function handleInfo(interaction, userData) {
    const crewName = interaction.options.getString('crew');
    let targetCrew;
    
    if (crewName) {
        targetCrew = crewSystem.findCrewByName(crewName);
        if (!targetCrew) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Crew Not Found')
                .setDescription(`No crew named **${crewName}** was found.`);
            return await interaction.reply({ embeds: [embed] });
        }
    } else {
        if (!userData.crewId) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.WARNING)
                .setTitle('⚓ No Crew')
                .setDescription('You\'re not part of any crew! Use `/crew create` to start your own crew or get invited to join one.');
            return await interaction.reply({ embeds: [embed] });
        }
        targetCrew = database.getCrew(userData.crewId);
    }
    
    // Get crew member details
    const members = targetCrew.members.map(memberId => {
        const member = database.getUser(memberId);
        if (member) {
            const roleEmoji = member.crewRole === 'captain' ? '👑' : '⚓';
            return `${roleEmoji} ${member.username} (Lv.${member.level})`;
        }
        return '❓ Unknown Member';
    });
    
    const captain = database.getUser(targetCrew.captain);
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle(`🏴‍☠️ ${targetCrew.name}`)
        .addFields(
            { name: '👑 Captain', value: captain ? captain.username : 'Unknown', inline: true },
            { name: '👥 Members', value: `${targetCrew.members.length}`, inline: true },
            { name: '⭐ Crew Level', value: `${targetCrew.level}`, inline: true },
            { name: '🏆 Reputation', value: `${targetCrew.reputation}`, inline: true },
            { name: '💰 Bounty', value: `₿${targetCrew.bounty.toLocaleString()}`, inline: true },
            { name: '🗺️ Territories', value: `${targetCrew.territories.length}`, inline: true },
            { name: '👥 Crew Roster', value: members.slice(0, 10).join('\n') || 'No members' }
        );
        
    if (targetCrew.victories > 0) {
        embed.addFields({
            name: '🏆 Achievements',
            value: `**${targetCrew.victories}** Victories\n**${targetCrew.treasuresFound}** Treasures Found\n**${targetCrew.locationsDiscovered.length}** Locations Discovered`
        });
    }
    
    embed.setFooter({ text: `Crew founded ${new Date(targetCrew.createdAt).toDateString()}` });
    
    await interaction.reply({ embeds: [embed] });
}

async function handleInvite(interaction, userData) {
    const targetUser = interaction.options.getUser('user');
    const targetUserData = database.getUser(targetUser.id);
    
    // Check if invoker is in a crew and is captain
    if (!userData.crewId) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ No Crew')
            .setDescription('You need to be in a crew to invite others!');
        return await interaction.reply({ embeds: [embed] });
    }
    
    if (userData.crewRole !== 'captain') {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Not Captain')
            .setDescription('Only the crew captain can invite new members!');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Check if target user exists and is registered
    if (!targetUserData) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ User Not Registered')
            .setDescription(`${targetUser.username} hasn't registered as a pirate yet!`);
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Check if target user is already in a crew
    if (targetUserData.crewId) {
        const targetCrew = database.getCrew(targetUserData.crewId);
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('⚓ Already in Crew')
            .setDescription(`${targetUser.username} is already a member of **${targetCrew ? targetCrew.name : 'another crew'}**!`);
        return await interaction.reply({ embeds: [embed] });
    }
    
    const crew = database.getCrew(userData.crewId);
    const inviteResult = crewSystem.inviteUser(crew.id, targetUser.id);
    
    if (inviteResult.success) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('📨 Invitation Sent!')
            .setDescription(`You've invited **${targetUser.username}** to join **${crew.name}**!`)
            .addFields(
                { name: '👥 Invited User', value: targetUser.username, inline: true },
                { name: '🏴‍☠️ Your Crew', value: crew.name, inline: true },
                { name: '💡 Next Step', value: `${targetUser.username} can use \`/crew join ${crew.name}\` to accept the invitation!` }
            );
            
        await interaction.reply({ embeds: [embed] });
        
        // Try to DM the invited user
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(config.COLORS.PRIMARY)
                .setTitle('🏴‍☠️ Crew Invitation!')
                .setDescription(`**${userData.username}** has invited you to join the **${crew.name}** crew!`)
                .addFields(
                    { name: '🎯 To Accept', value: `Use \`/crew join ${crew.name}\` in any server with the bot!` },
                    { name: '⚓ Crew Captain', value: userData.username }
                );
                
            await targetUser.send({ embeds: [dmEmbed] });
        } catch (error) {
            // User has DMs disabled, which is fine
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Invitation Failed')
            .setDescription(inviteResult.error || 'Failed to send the invitation.');
        await interaction.reply({ embeds: [embed] });
    }
}

async function handleJoin(interaction, userData) {
    const crewName = interaction.options.getString('crew');
    const userId = interaction.user.id;
    
    // Check if user is already in a crew
    if (userData.crewId) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('⚓ Already in Crew')
            .setDescription('You\'re already part of a crew! Leave your current crew first if you want to join another.');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Find the crew
    const targetCrew = crewSystem.findCrewByName(crewName);
    if (!targetCrew) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Crew Not Found')
            .setDescription(`No crew named **${crewName}** was found.`);
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Check if user has an invitation
    const joinResult = crewSystem.joinCrew(targetCrew.id, userId);
    
    if (joinResult.success) {
        // Update user data
        userData.crewId = targetCrew.id;
        userData.crewRole = 'member';
        database.updateUser(userId, userData);
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('🎉 Welcome Aboard!')
            .setDescription(`You've successfully joined the **${targetCrew.name}** crew!`)
            .addFields(
                { name: '🏴‍☠️ Crew', value: targetCrew.name, inline: true },
                { name: '👑 Captain', value: database.getUser(targetCrew.captain)?.username || 'Unknown', inline: true },
                { name: '👥 Members', value: `${targetCrew.members.length + 1}`, inline: true },
                { name: '🎯 Your Role', value: 'Crew Member' }
            )
            .setFooter({ text: 'Set sail with your new crew and conquer the Grand Line!' });
            
        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Join Failed')
            .setDescription(joinResult.error || 'Failed to join the crew.');
        await interaction.reply({ embeds: [embed] });
    }
}

async function handleLeave(interaction, userData) {
    if (!userData.crewId) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('⚓ No Crew')
            .setDescription('You\'re not part of any crew!');
        return await interaction.reply({ embeds: [embed] });
    }
    
    const crew = database.getCrew(userData.crewId);
    const leaveResult = crewSystem.leaveCrew(userData.crewId, interaction.user.id);
    
    if (leaveResult.success) {
        // Update user data
        userData.crewId = null;
        userData.crewRole = 'member';
        database.updateUser(interaction.user.id, userData);
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('⚓ Left Crew')
            .setDescription(`You've left the **${crew.name}** crew.`)
            .addFields(
                { name: '🏴‍☠️ Former Crew', value: crew.name },
                { name: '🎯 Status', value: 'You are now a solo pirate!' },
                { name: '💡 Next Steps', value: 'You can create a new crew or join another one!' }
            );
            
        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Leave Failed')
            .setDescription(leaveResult.error || 'Failed to leave the crew.');
        await interaction.reply({ embeds: [embed] });
    }
}

async function handleKick(interaction, userData) {
    const targetUser = interaction.options.getUser('user');
    
    // Check if user is captain
    if (userData.crewRole !== 'captain') {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Not Captain')
            .setDescription('Only the crew captain can kick members!');
        return await interaction.reply({ embeds: [embed] });
    }
    
    if (!userData.crewId) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ No Crew')
            .setDescription('You need to be in a crew to kick members!');
        return await interaction.reply({ embeds: [embed] });
    }
    
    const kickResult = crewSystem.kickMember(userData.crewId, targetUser.id);
    
    if (kickResult.success) {
        // Update target user data
        const targetUserData = database.getUser(targetUser.id);
        if (targetUserData) {
            targetUserData.crewId = null;
            targetUserData.crewRole = 'member';
            database.updateUser(targetUser.id, targetUserData);
        }
        
        const crew = database.getCrew(userData.crewId);
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('⚓ Member Removed')
            .setDescription(`**${targetUser.username}** has been removed from **${crew.name}**.`)
            .addFields(
                { name: '👤 Removed Member', value: targetUser.username },
                { name: '🏴‍☠️ Crew', value: crew.name },
                { name: '👥 Remaining Members', value: `${crew.members.length}` }
            );
            
        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Kick Failed')
            .setDescription(kickResult.error || 'Failed to kick the member.');
        await interaction.reply({ embeds: [embed] });
    }
}

async function handleList(interaction, userData) {
    const allCrews = database.getAllCrews();
    
    if (allCrews.length === 0) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle('🏴‍☠️ No Crews')
            .setDescription('There are no active crews yet! Be the first to create one with `/crew create`!');
        return await interaction.reply({ embeds: [embed] });
    }
    
    // Sort crews by member count and reputation
    const sortedCrews = allCrews
        .sort((a, b) => (b.members.length * 100 + b.reputation) - (a.members.length * 100 + a.reputation))
        .slice(0, 10); // Show top 10 crews
    
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle('🏴‍☠️ Active Pirate Crews')
        .setDescription(`There are **${allCrews.length}** active crews sailing the Grand Line!`);
    
    sortedCrews.forEach((crew, index) => {
        const captain = database.getUser(crew.captain);
        const ranking = index + 1;
        const rankingEmoji = ranking === 1 ? '🥇' : ranking === 2 ? '🥈' : ranking === 3 ? '🥉' : `${ranking}.`;
        
        embed.addFields({
            name: `${rankingEmoji} ${crew.name}`,
            value: `👑 **${captain?.username || 'Unknown'}**\n👥 ${crew.members.length} members\n🏆 ${crew.reputation} reputation`,
            inline: true
        });
    });
    
    embed.setFooter({ text: 'Use /crew info <name> to view detailed crew information!' });
    
    await interaction.reply({ embeds: [embed] });
}
