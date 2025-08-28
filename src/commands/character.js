import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const data = new SlashCommandBuilder()
    .setName('character')
    .setDescription('View your character sheet with your stats and information.');

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Fetch the user, their character, and the character's stats in one query
    const userWithCharacter = await db.query.users.findFirst({
        where: eq(users.discordId, interaction.user.id),
        with: {
            characters: {
                with: {
                    stats: true,
                },
            },
        },
    });

    // Check if the user or character exists
    if (!userWithCharacter || !userWithCharacter.characters || userWithCharacter.characters.length === 0) {
        return interaction.editReply('You have not created a character yet. Use `/start` to begin your adventure!');
    }

    // Assuming one character per user for now
    const character = userWithCharacter.characters[0];
    const charStats = character.stats;

    if (!charStats) {
        return interaction.editReply('An error occurred. Your character data is incomplete. Please contact an admin.');
    }

    // Create the embed with the character's information
    const characterEmbed = new EmbedBuilder()
        .setColor('#FFD700') // Gold color
        .setTitle(`Character Sheet: ${character.name}`)
        .setDescription(`*A ${character.race} from ${character.origin} whose dream is to become the ${character.dream}.*`)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .addFields(
            { name: '📜 Faction', value: character.faction, inline: true },
            { name: '👤 Race', value: character.race, inline: true },
            { name: '🏝️ Origin', value: character.origin, inline: true },
            { name: '\u200B', value: '\u200B' }, // Blank field for spacing
            { name: 'Base Stats', value: '---', inline: false },
            { name: '💪 Strength', value: charStats.strength.toString(), inline: true },
            { name: '🏃 Agility', value: charStats.agility.toString(), inline: true },
            { name: '맷 Durability', value: charStats.durability.toString(), inline: true },
            { name: '🧠 Intelligence', value: charStats.intelligence.toString(), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'One Piece RPG' });

    await interaction.editReply({ embeds: [characterEmbed] });
}

export default { data, execute };
