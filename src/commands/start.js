import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { db } from '../db/index.js';
import { users, characters, stats } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// --- Data Definitions ---
const RACES = {
    Human: { label: 'Human', description: '+1 all stats, 10% more XP.', stats: { str: 1, agi: 1, dur: 1, int: 1 } },
    'Fish-Man': { label: 'Fish-Man', description: '+2 Str, +1 Dur. Water Breathing.', stats: { str: 2, agi: 0, dur: 1, int: 0 } },
    Mink: { label: 'Mink', description: '+2 Agi, +1 Str. Electro ability.', stats: { str: 1, agi: 2, dur: 0, int: 0 } },
    Skypiean: { label: 'Skypiean', description: '+2 Int, +1 Agi. Starts with a Dial.', stats: { str: 0, agi: 1, dur: 0, int: 2 } },
    Giant: { label: 'Giant', description: '+4 Str, +2 Dur, -2 Agi. Giant\'s Strength.', stats: { str: 4, agi: -2, dur: 2, int: 0 } },
};

const ORIGINS = {
    'Shells Town': { label: 'Shells Town', faction: 'Marine Recruit', description: 'Start as a Marine Recruit.' },
    'Syrup Village': { label: 'Syrup Village', faction: 'Pirate Hopeful', description: 'Start as a Pirate Hopeful.' },
    Ohara: { label: 'Ohara', faction: 'Revolutionary Seed', description: 'Start as a Revolutionary Seed.' },
    Baratie: { label: 'Baratie', faction: 'Neutral', description: 'Start as a Cook/Brawler.' },
};

const DREAMS = {
    Swordsman: { label: 'Greatest Swordsman', description: 'Start with a Katana and a swordsman skill.' },
    Cook: { label: 'Find the All Blue', description: 'Start with cooking recipes and healing items.' },
    Navigator: { label: 'Map the World', description: 'Start with a Log Pose.' },
    Warrior: { label: 'Brave Warrior of the Sea', description: 'Start with higher base health.' },
};

// --- Command Definition ---
export const data = new SlashCommandBuilder()
    .setName('start')
    .setDescription('Begin your adventure and create your character!');

// --- Command Execution ---
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const existingUser = await db.query.users.findFirst({
        where: eq(users.discordId, interaction.user.id),
        with: { characters: true },
    });

    if (existingUser && existingUser.characters.length > 0) {
        return interaction.editReply('You have already started your adventure! Use `/character` to see your character.');
    }

    const userId = existingUser ? existingUser.id : (await db.insert(users).values({ discordId: interaction.user.id }).returning({ id: users.id }))[0].id;

    const characterData = {};
    let currentStep = 'race';

    // --- Component Builders ---
    const createSelectMenu = (id, placeholder, options) => new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(id).setPlaceholder(placeholder).addOptions(options));
    const createButtons = (confirmId, cancelId) => new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(confirmId).setLabel('Confirm').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(cancelId).setLabel('Cancel').setStyle(ButtonStyle.Danger)
    );

    // --- Embed Builders ---
    const createStepEmbed = (title, description, fields) => new EmbedBuilder().setColor('#1E90FF').setTitle(title).setDescription(description).addFields(fields);

    // --- Initial Step: Race ---
    const raceOptions = Object.entries(RACES).map(([value, { label, description }]) => ({ label, value, description: description.split('.')[0] }));
    const raceEmbed = createStepEmbed('Choose Your Destiny (1/3): Race', 'Your race determines your starting bonuses and unique abilities.', Object.values(RACES).map(r => ({ name: r.label, value: r.description, inline: true })));
    const raceRow = createSelectMenu('start_select', 'Select a race...', raceOptions);
    const message = await interaction.editReply({ embeds: [raceEmbed], components: [raceRow], ephemeral: true });

    // --- Interaction Collector ---
    const collector = message.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 300000, // 5 minutes
    });

    collector.on('collect', async i => {
        await i.deferUpdate();

        if (i.isStringSelectMenu()) {
            const [value] = i.values;
            if (currentStep === 'race') {
                characterData.race = value;
                currentStep = 'origin';

                const originOptions = Object.entries(ORIGINS).map(([value, { label, description }]) => ({ label, value, description }));
                const originEmbed = createStepEmbed('Choose Your Destiny (2/3): Origin', 'Your origin sets your starting faction and opening quests.', Object.values(ORIGINS).map(o => ({ name: o.label, value: o.description, inline: true })));
                const originRow = createSelectMenu('start_select', 'Select an origin...', originOptions);
                await i.editReply({ embeds: [originEmbed], components: [originRow] });

            } else if (currentStep === 'origin') {
                characterData.origin = value;
                characterData.faction = ORIGINS[value].faction;
                currentStep = 'dream';

                const dreamOptions = Object.entries(DREAMS).map(([value, { label, description }]) => ({ label, value, description }));
                const dreamEmbed = createStepEmbed('Choose Your Destiny (3/3): Dream', 'Your dream provides an initial proficiency and shapes your early gameplay.', Object.values(DREAMS).map(d => ({ name: d.label, value: d.description, inline: true })));
                const dreamRow = createSelectMenu('start_select', 'Select a dream...', dreamOptions);
                await i.editReply({ embeds: [dreamEmbed], components: [dreamRow] });

            } else if (currentStep === 'dream') {
                characterData.dream = value;
                currentStep = 'confirm';

                const confirmEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('Confirm Your Destiny')
                    .setDescription('This is the path you have chosen. Are you ready to begin your adventure?')
                    .addFields(
                        { name: 'Race', value: characterData.race, inline: true },
                        { name: 'Origin', value: characterData.origin, inline: true },
                        { name: 'Faction', value: characterData.faction, inline: true },
                        { name: 'Dream', value: characterData.dream, inline: true }
                    );
                const confirmRow = createButtons('start_confirm', 'start_cancel');
                await i.editReply({ embeds: [confirmEmbed], components: [confirmRow] });
            }
        } else if (i.isButton()) {
            collector.stop();
            if (i.customId === 'start_confirm') {
                try {
                    // Save character and stats in a transaction
                    await db.transaction(async (tx) => {
                        const newChar = await tx.insert(characters).values({
                            userId: userId,
                            name: interaction.user.username,
                            race: characterData.race,
                            origin: characterData.origin,
                            faction: characterData.faction,
                            dream: characterData.dream,
                        }).returning({ id: characters.id });

                        const characterId = newChar[0].id;
                        const baseStats = RACES[characterData.race].stats;

                        await tx.insert(stats).values({
                            characterId: characterId,
                            strength: baseStats.str,
                            agility: baseStats.agi,
                            durability: baseStats.dur,
                            intelligence: baseStats.int,
                        });
                    });

                    const successEmbed = new EmbedBuilder().setColor('#228B22').setTitle('Adventure Awaits!').setDescription(`Welcome to the world, ${interaction.user.username}! Your journey as a ${characterData.race} from ${characterData.origin} begins now. Use the \`/character\` command to view your new stats!`);
                    await i.editReply({ embeds: [successEmbed], components: [] });

                } catch (error) {
                    console.error('Failed to save character:', error);
                    await i.editReply({ content: 'An error occurred while creating your character. Please try again later.', embeds: [], components: [] });
                }
            } else if (i.customId === 'start_cancel') {
                await i.editReply({ content: 'Character creation cancelled.', embeds: [], components: [] });
            }
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            interaction.editReply({ content: 'Character creation has timed out. Please run `/start` again.', embeds: [], components: [] });
        }
    });
}

export default { data, execute };
