const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');
const database = require('./database/database.js');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize commands collection
client.commands = new Collection();
client.cooldowns = new Collection();

// Load command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`[INFO] Loaded command: ${command.data.name}`);
    } else {
        console.log(`[WARNING] Command at ${filePath} is missing required "data" or "execute" property.`);
    }
}

// Bot ready event
client.once('ready', async () => {
    console.log(`[INFO] ${client.user.tag} is online!`);
    console.log(`[INFO] Bot is running on ${client.guilds.cache.size} servers`);
    
    // Initialize database
    await database.initialize();
    
    // Register slash commands globally
    try {
        const commands = [];
        client.commands.forEach(command => {
            commands.push(command.data.toJSON());
        });
        
        await client.application.commands.set(commands);
        console.log(`[INFO] Successfully registered ${commands.length} slash commands globally.`);
    } catch (error) {
        console.error('[ERROR] Failed to register slash commands:', error);
    }
});

// Handle all interactions (commands and components)
client.on('interactionCreate', async interaction => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`[ERROR] Error executing ${interaction.commandName}:`, error);
            
            const errorMessage = {
                content: '❌ There was an error while executing this command!',
                ephemeral: true
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
    
    // Handle select menu interactions
    else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'wiki_navigation') {
            try {
                // Import the wiki pages data directly
                const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
                const config = require('./config.js');
                
                const wikiPages = {
                    overview: {
                        title: '🏴‍☠️ One Piece RPG - Game Overview',
                        description: 'Welcome to the One Piece RPG Discord Bot! Set sail on your pirate adventure in the world of One Piece.',
                        fields: [
                            {
                                name: '🎮 What is this game?',
                                value: 'An RPG adventure where you create your pirate character, explore the Grand Line, battle enemies, collect Devil Fruits, form crews, and hunt for the legendary One Piece treasure!',
                                inline: false
                            },
                            {
                                name: '🚀 Getting Started',
                                value: '1. Use `/register` to create your pirate\n2. Check your stats with `/profile`\n3. Start exploring with `/explore`\n4. Build your legend!',
                                inline: false
                            },
                            {
                                name: '🗺️ World Progression',
                                value: '**East Blue** (Lv.1-15) → **Grand Line** (Lv.16-50) → **New World** (Lv.51-100)',
                                inline: false
                            },
                            {
                                name: '📊 Core Stats',
                                value: '**❤️ Health**: Your life force\n**⚔️ Attack**: Damage you deal\n**🛡️ Defense**: Damage reduction\n**⭐ Level**: Overall progression',
                                inline: false
                            }
                        ]
                    },
                    commands: {
                        title: '📖 Command Reference Guide',
                        description: 'Complete list of all available commands and their usage.',
                        fields: [
                            {
                                name: '👤 Character Commands',
                                value: '`/register` - Create your pirate character\n`/profile` - View your character stats\n`/profile @user` - View another player\'s profile',
                                inline: false
                            },
                            {
                                name: '🗺️ Adventure Commands', 
                                value: '`/explore` - Explore new locations and encounter adventures\n`/combat` - Engage in turn-based battles\n`/treasure` - Search for hidden treasures',
                                inline: false
                            },
                            {
                                name: '🍎 Devil Fruit Commands',
                                value: '`/devilfruit search` - Search for Devil Fruits\n`/devilfruit train` - Train your Devil Fruit powers\n`/devilfruit list` - View available Devil Fruits',
                                inline: false
                            },
                            {
                                name: '💰 Economy Commands',
                                value: '`/shop` - Browse and buy items\n`/shop buy <item>` - Purchase specific items\n`/shop sell <item>` - Sell items from inventory',
                                inline: false
                            },
                            {
                                name: '👥 Crew Commands',
                                value: '`/crew create <name>` - Form a new pirate crew\n`/crew join <name>` - Join an existing crew\n`/crew info` - View crew information\n`/crew leave` - Leave your current crew',
                                inline: false
                            },
                            {
                                name: '❓ Help Commands',
                                value: '`/help` - Quick command overview\n`/wiki` - This comprehensive guide\n`/guide` - Alternative to /wiki',
                                inline: false
                            }
                        ]
                    },
                    combat: {
                        title: '⚔️ Combat System Guide',
                        description: 'Master the art of battle in the One Piece world.',
                        fields: [
                            {
                                name: '🎯 Combat Basics',
                                value: 'Combat is **turn-based** where you and your enemy take turns attacking until one is defeated.',
                                inline: false
                            },
                            {
                                name: '💥 Damage Calculation',
                                value: '**Damage = Your Attack - Enemy Defense**\nHigher attack deals more damage, higher defense reduces incoming damage.',
                                inline: false
                            },
                            {
                                name: '🎲 Combat Actions',
                                value: '**Attack** - Deal damage to enemy\n**Defend** - Reduce incoming damage next turn\n**Special** - Use Devil Fruit abilities (if available)',
                                inline: false
                            },
                            {
                                name: '🏆 Victory Rewards',
                                value: '**Experience Points**: Level up and increase stats\n**Berries**: Currency for buying items\n**Item Drops**: Random equipment and materials',
                                inline: false
                            },
                            {
                                name: '⚡ Critical Hits',
                                value: 'Random chance to deal **2x damage** on attacks. Higher level increases crit chance.',
                                inline: false
                            },
                            {
                                name: '🔄 Combat Cooldown',
                                value: `Combat has a **${config.COMBAT_COOLDOWN/1000} second cooldown** between battles to prevent spam.`,
                                inline: false
                            }
                        ]
                    },
                    exploration: {
                        title: '🗺️ Exploration System Guide', 
                        description: 'Discover the vast world of One Piece through exploration.',
                        fields: [
                            {
                                name: '🌍 How Exploration Works',
                                value: 'Use `/explore` to venture into new areas and discover random encounters based on your level.',
                                inline: false
                            },
                            {
                                name: '🎲 Possible Encounters',
                                value: '**🏴‍☠️ Enemy Battles** (60%) - Fight pirates, marines, and monsters\n**👑 Ally Meetings** (10%) - Meet One Piece characters\n**💎 Treasure Discovery** (15%) - Find berries and items\n**🍎 Devil Fruit Hunt** (2%) - Rare Devil Fruit encounters',
                                inline: false
                            },
                            {
                                name: '📍 Location Progression',
                                value: '**East Blue** → Foosha Village, Shells Town, Orange Town\n**Grand Line** → Whisky Peak, Alabasta, Skypiea\n**New World** → Fishman Island, Dressrosa, Wano',
                                inline: false
                            },
                            {
                                name: '⚠️ Danger Levels',
                                value: '**Very Low** 🟢 **Low** 🟡 **Moderate** 🟠 **High** 🔴 **Extreme** ⚫ **Legendary** 🟣',
                                inline: false
                            },
                            {
                                name: '⏱️ Exploration Cooldown',
                                value: `**${config.EXPLORE_COOLDOWN/1000} seconds** between explorations to maintain game balance.`,
                                inline: false
                            }
                        ]
                    },
                    devilfruits: {
                        title: '🍎 Devil Fruit System Guide',
                        description: 'Harness the mysterious powers of Devil Fruits.',
                        fields: [
                            {
                                name: '🔍 Finding Devil Fruits',
                                value: 'Devil Fruits are **extremely rare** (2% chance) and can be found through:\n• Exploration encounters\n• Defeating powerful enemies\n• Special treasure hunts',
                                inline: false
                            },
                            {
                                name: '📚 Devil Fruit Types',
                                value: '**Paramecia** - Superhuman abilities\n**Zoan** - Animal transformations\n**Logia** - Elemental control powers',
                                inline: false
                            },
                            {
                                name: '⭐ Rarity System',
                                value: '**Common** → **Uncommon** → **Rare** → **Epic** → **Mythical** → **Legendary**\nRarer fruits provide stronger stat bonuses and unique abilities.',
                                inline: false
                            },
                            {
                                name: '💪 Training Powers',
                                value: 'Use `/devilfruit train` to increase your Devil Fruit mastery and unlock new abilities. Training costs berries but greatly increases your power.',
                                inline: false
                            },
                            {
                                name: '🌊 Devil Fruit Weakness',
                                value: 'Remember: Devil Fruit users lose their ability to swim! This affects certain exploration encounters.',
                                inline: false
                            },
                            {
                                name: '⏱️ Training Cooldown',
                                value: `**${config.DEVIL_FRUIT_COOLDOWN/1000/60} minutes** between training sessions.`,
                                inline: false
                            }
                        ]
                    },
                    economy: {
                        title: '💰 Economy & Items Guide',
                        description: 'Master the economic systems and item management.',
                        fields: [
                            {
                                name: '💎 Berries (₿) - Currency',
                                value: `Everyone starts with **₿${config.STARTING_BERRIES.toLocaleString()}**. Earn more through:\n• Winning battles\n• Finding treasures\n• Selling items\n• Completing crew activities`,
                                inline: false
                            },
                            {
                                name: '🛍️ Shop System',
                                value: '**Weapons** ⚔️ - Increase attack power\n**Armor** 🛡️ - Boost defense and health\n**Accessories** 💍 - Balanced stat bonuses\n**Consumables** 🧪 - Temporary effects\n**Tools** 🔧 - Special utilities',
                                inline: false
                            },
                            {
                                name: '📊 Item Rarity & Pricing',
                                value: '**Common** (Gray) - Basic items, affordable\n**Uncommon** (Green) - Decent upgrades\n**Rare** (Blue) - Significant improvements\n**Epic** (Purple) - Powerful equipment\n**Legendary** (Gold) - End-game gear',
                                inline: false
                            },
                            {
                                name: '🎒 Equipment Slots',
                                value: 'You can equip:\n• **1 Weapon** for maximum attack\n• **1 Armor** for defense\n• **1 Accessory** for balanced stats\n• **Consumables** for temporary boosts',
                                inline: false
                            },
                            {
                                name: '💸 Selling Strategy',
                                value: 'Items sell for **60% of purchase price**. Keep better items and sell outdated equipment for berries.',
                                inline: false
                            }
                        ]
                    },
                    crews: {
                        title: '👥 Crew System Guide',
                        description: 'Unite with other pirates to build a legendary crew.',
                        fields: [
                            {
                                name: '🏴‍☠️ Creating a Crew',
                                value: 'Use `/crew create <name>` to form your own pirate crew. You become the **Captain** with full control over crew activities.',
                                inline: false
                            },
                            {
                                name: '⚓ Joining a Crew',
                                value: 'Use `/crew join <name>` to request joining an existing crew. The captain must accept your request.',
                                inline: false
                            },
                            {
                                name: '👑 Crew Roles',
                                value: '**Captain** 👑 - Full crew management control\n**Member** ⚓ - Participate in crew activities\n**Officer** ⭐ - Limited management abilities (future feature)',
                                inline: false
                            },
                            {
                                name: '📈 Crew Benefits',
                                value: '• **Shared Treasury** for group purchases\n• **Reputation System** for crew fame\n• **Territory Control** for resource bonuses\n• **Group Adventures** and special events',
                                inline: false
                            },
                            {
                                name: '🏆 Crew Progression',
                                value: 'Crews level up through member activities:\n• Member battles and exploration\n• Collective treasure hunting\n• Territory conquests\n• Special crew missions',
                                inline: false
                            },
                            {
                                name: '🗺️ Territory System',
                                value: 'High-level crews can claim territories for:\n• **Resource Bonuses** for all members\n• **Exclusive Hunting Grounds**\n• **Strategic Advantages** in conflicts',
                                inline: false
                            }
                        ]
                    },
                    strategy: {
                        title: '🧠 Strategy & Tips Guide',
                        description: 'Pro tips to become the Pirate King.',
                        fields: [
                            {
                                name: '🎯 Early Game Strategy (Lv.1-15)',
                                value: '• Focus on **exploration** for XP and berries\n• Buy basic equipment from shop\n• Join or create a crew for support\n• Save berries for better gear',
                                inline: false
                            },
                            {
                                name: '⚡ Mid Game Strategy (Lv.16-50)', 
                                value: '• Hunt for **Devil Fruits** actively\n• Upgrade to rare/epic equipment\n• Focus on crew reputation building\n• Challenge stronger enemies for better rewards',
                                inline: false
                            },
                            {
                                name: '👑 Late Game Strategy (Lv.51+)',
                                value: '• Master Devil Fruit abilities fully\n• Collect legendary equipment\n• Lead territorial conquests\n• Aim for the **One Piece** ultimate goal',
                                inline: false
                            },
                            {
                                name: '💡 Combat Tips',
                                value: '• **Defend** before big enemy attacks\n• Use **special abilities** strategically\n• Higher level = more critical hits\n• Equipment makes huge differences',
                                inline: false
                            },
                            {
                                name: '🎲 RNG Management',
                                value: '• Exploration has **cooldowns** - use them wisely\n• **Treasure hunting** has best berry/time ratio\n• Devil Fruit searches are rare but worthwhile\n• Crew activities provide consistent progress',
                                inline: false
                            },
                            {
                                name: '🏴‍☠️ Path to Pirate King',
                                value: '• Reach **Level 100**\n• Master a **Legendary Devil Fruit**\n• Lead a **Max Level Crew**\n• Control multiple **Territories**\n• Find the **One Piece**',
                                inline: false
                            }
                        ]
                    }
                };
                
                const selectedPage = interaction.values[0];
                const pageData = wikiPages[selectedPage];
                
                if (!pageData) {
                    return interaction.update({
                        content: '❌ Invalid wiki page selected!',
                        embeds: [],
                        components: [],
                        ephemeral: true
                    });
                }
                
                // Create the embed
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.PRIMARY)
                    .setTitle(pageData.title)
                    .setDescription(pageData.description)
                    .addFields(pageData.fields)
                    .setFooter({ 
                        text: 'Use the dropdown menu below to navigate between guide pages',
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setTimestamp();

                // Recreate navigation dropdown
                const navigationMenu = new StringSelectMenuBuilder()
                    .setCustomId('wiki_navigation')
                    .setPlaceholder('📚 Select a guide page...')
                    .addOptions([
                        {
                            label: 'Game Overview',
                            description: 'Basic introduction to the One Piece RPG',
                            value: 'overview',
                            emoji: '🏴‍☠️'
                        },
                        {
                            label: 'Commands Reference',
                            description: 'Complete list of all available commands',
                            value: 'commands',
                            emoji: '📖'
                        },
                        {
                            label: 'Combat System',
                            description: 'Learn how battles and combat work',
                            value: 'combat',
                            emoji: '⚔️'
                        },
                        {
                            label: 'Exploration Guide',
                            description: 'Discover locations and encounters',
                            value: 'exploration',
                            emoji: '🗺️'
                        },
                        {
                            label: 'Devil Fruits',
                            description: 'Everything about Devil Fruit powers',
                            value: 'devilfruits',
                            emoji: '🍎'
                        },
                        {
                            label: 'Economy & Items',
                            description: 'Berries, shop, and equipment guide',
                            value: 'economy',
                            emoji: '💰'
                        },
                        {
                            label: 'Crew System',
                            description: 'Form and manage pirate crews',
                            value: 'crews',
                            emoji: '👥'
                        },
                        {
                            label: 'Strategy & Tips',
                            description: 'Pro tips to become Pirate King',
                            value: 'strategy',
                            emoji: '🧠'
                        }
                    ]);

                const row = new ActionRowBuilder().addComponents(navigationMenu);

                await interaction.update({
                    embeds: [embed],
                    components: [row]
                });
                
            } catch (error) {
                console.error('[ERROR] Error handling wiki navigation:', error);
                await interaction.reply({
                    content: '❌ There was an error loading that wiki page!',
                    ephemeral: true
                });
            }
        }
    }
});

// Error handling
client.on('error', error => {
    console.error('[ERROR] Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('[ERROR] Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('[ERROR] Uncaught exception:', error);
    process.exit(1);
});

// Login to Discord
client.login(config.DISCORD_TOKEN);
