const { SlashCommandBuilder } = require('discord.js');
const wikiCommand = require('./wiki.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guide')
        .setDescription('Complete guide to the One Piece RPG game (alias for /wiki)')
        .addStringOption(option =>
            option.setName('page')
                .setDescription('Select a guide page to view')
                .setRequired(false)
                .addChoices(
                    { name: '🏴‍☠️ Game Overview', value: 'overview' },
                    { name: '📖 Commands Reference', value: 'commands' },
                    { name: '⚔️ Combat System', value: 'combat' },
                    { name: '🗺️ Exploration Guide', value: 'exploration' },
                    { name: '🍎 Devil Fruits', value: 'devilfruits' },
                    { name: '💰 Economy & Items', value: 'economy' },
                    { name: '👥 Crew System', value: 'crews' },
                    { name: '🧠 Strategy & Tips', value: 'strategy' }
                )),

    async execute(interaction) {
        // Simply execute the wiki command - they are identical
        return await wikiCommand.execute(interaction);
    }
};