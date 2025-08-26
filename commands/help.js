const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help and information about the One Piece RPG bot')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Get help for a specific category')
                .setRequired(false)
                .addChoices(
                    { name: 'Getting Started', value: 'getting_started' },
                    { name: 'Combat & Exploration', value: 'combat' },
                    { name: 'Devil Fruits', value: 'devil_fruits' },
                    { name: 'Economy & Shop', value: 'economy' },
                    { name: 'Crews', value: 'crews' },
                    { name: 'Treasure Hunting', value: 'treasure' }
                )
        ),
        
    async execute(interaction) {
        const category = interaction.options.getString('category');
        
        if (category) {
            await showSpecificHelp(interaction, category);
        } else {
            await showMainHelp(interaction);
        }
    }
};

async function showMainHelp(interaction) {
    const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle('🏴‍☠️ One Piece RPG Bot - Help')
        .setDescription('Welcome to the ultimate One Piece RPG experience! Set sail on the Grand Line and become the next Pirate King!')
        .setThumbnail('https://i.imgur.com/onepiece_logo.png') // Placeholder
        .addFields(
            { name: '🎮 Getting Started', value: '`/register` - Start your pirate adventure\n`/profile` - View your character stats', inline: true },
            { name: '⚔️ Combat & Exploration', value: '`/explore` - Discover new locations and enemies\n`/combat` - Check current battle status', inline: true },
            { name: '🍎 Devil Fruits', value: '`/devilfruit search` - Hunt for Devil Fruits\n`/devilfruit info` - View your power', inline: true },
            { name: '💰 Economy', value: '`/shop browse` - View the merchant shop\n`/shop inventory` - Check your items', inline: true },
            { name: '👥 Crews', value: '`/crew create` - Found your own crew\n`/crew list` - View all active crews', inline: true },
            { name: '💎 Treasure', value: '`/treasure` - Search for hidden treasures\n`/help treasure` - Learn about treasure hunting', inline: true }
        )
        .addFields(
            { name: '📊 Quick Stats', value: '• **Cooldowns**: Explore (30s), Combat (15s), Treasure (1m), Devil Fruit (5m)\n• **Starting Stats**: 100 HP, 20 ATK, 10 DEF, ₿1000\n• **Max Level**: 100' },
            { name: '🔗 Useful Commands', value: '`/help <category>` - Get detailed help for specific features\n`/profile @user` - View another player\'s stats' }
        )
        .setFooter({ text: 'Use /help <category> for detailed information about specific features!' })
        .setTimestamp();
        
    await interaction.reply({ embeds: [embed] });
}

async function showSpecificHelp(interaction, category) {
    let embed;
    
    switch (category) {
        case 'getting_started':
            embed = new EmbedBuilder()
                .setColor(config.COLORS.SUCCESS)
                .setTitle('🎮 Getting Started Guide')
                .setDescription('Everything you need to know to begin your One Piece adventure!')
                .addFields(
                    { name: '1️⃣ Register', value: '**`/register`** - Create your pirate character and start with:\n• Level 1\n• 100 Health\n• ₿1000 Berries\n• Basic stats' },
                    { name: '2️⃣ Explore', value: '**`/explore`** - Start exploring the Grand Line:\n• Discover new locations\n• Fight enemies to gain EXP and Berries\n• Find treasures and allies\n• Encounter One Piece characters' },
                    { name: '3️⃣ Level Up', value: '**Gain Experience by:**\n• Winning battles\n• Finding treasures\n• Discovering new locations\n• Training Devil Fruit powers' },
                    { name: '4️⃣ Build Your Character', value: '• Buy equipment from the shop\n• Search for Devil Fruits\n• Join or create a crew\n• Collect allies and treasures' }
                )
                .setFooter({ text: 'Pro tip: Start with /explore to find your first enemy and begin earning EXP!' });
            break;
            
        case 'combat':
            embed = new EmbedBuilder()
                .setColor(config.COLORS.COMBAT)
                .setTitle('⚔️ Combat & Exploration System')
                .setDescription('Master the art of pirate combat and exploration!')
                .addFields(
                    { name: '🗺️ Exploration', value: '**`/explore`** (30s cooldown)\n• Discover new islands and locations\n• Random encounters with:\n  - Enemies (60% chance)\n  - Allies (10% chance)\n  - Treasures (15% chance)' },
                    { name: '⚔️ Combat Mechanics', value: '**Turn-based battles:**\n• Attack - Deal damage to enemy\n• Defend - Reduce incoming damage\n• Special - Use Devil Fruit powers\n• Flee - Escape from battle (50% success)' },
                    { name: '📈 Enemy Tiers', value: '**Enemies scale with your level:**\n• Rookie Pirates (Lv 1-10)\n• Seasoned Pirates (Lv 11-25)\n• Elite Marines (Lv 26-50)\n• Warlords & Admirals (Lv 51+)' },
                    { name: '🏆 Victory Rewards', value: '• **Berries**: 50-500+ (based on enemy level)\n• **Experience**: 25-200+ (based on enemy level)\n• **Items**: Rare drops from strong enemies' }
                )
                .setFooter({ text: 'Combat tip: Defending reduces damage by 50% and builds up for stronger counter-attacks!' });
            break;
            
        case 'devil_fruits':
            embed = new EmbedBuilder()
                .setColor(config.COLORS.DEVIL_FRUIT)
                .setTitle('🍎 Devil Fruit System')
                .setDescription('Harness the mysterious powers of Devil Fruits!')
                .addFields(
                    { name: '🔍 Finding Devil Fruits', value: '**`/devilfruit search`** (5min cooldown)\n• 2% chance to find a Devil Fruit\n• Each fruit grants unique powers\n• Can only eat ONE Devil Fruit ever!' },
                    { name: '💫 Devil Fruit Types', value: '**Paramecia**: Enhance body/environment\n**Zoan**: Transform into animals\n**Logia**: Control natural elements\n**Mythical**: Legendary creature powers' },
                    { name: '⚡ Power Training', value: '**`/devilfruit train`** - Increase power level\n• Costs Berries (500 + level × 100)\n• Grants permanent stat bonuses\n• Max power level: 100' },
                    { name: '🌊 Sea Curse', value: '**Side Effects:**\n• Cannot swim (weakness to water)\n• Vulnerable to Seastone\n• Massive stat bonuses compensate' }
                )
                .setFooter({ text: 'Devil Fruit tip: Higher level fruits provide bigger stat bonuses per training session!' });
            break;
            
        case 'economy':
            embed = new EmbedBuilder()
                .setColor(config.COLORS.PRIMARY)
                .setTitle('💰 Economy & Shopping Guide')
                .setDescription('Master the art of pirate economics!')
                .addFields(
                    { name: '💰 Earning Berries', value: '**Primary Sources:**\n• Combat victories (50-500+)\n• Treasure hunting (100-25,000+)\n• Selling items (60% of purchase price)\n• Devil Fruit search consolation (500)' },
                    { name: '🏪 The Merchant Shop', value: '**`/shop browse`** - View available items\n**`/shop buy <item>`** - Purchase equipment\n**`/shop inventory`** - View your items\n**`/shop sell <item>`** - Sell for Berries' },
                    { name: '🎒 Equipment Types', value: '**⚔️ Weapons**: Increase attack power\n**🛡️ Armor**: Increase defense\n**💍 Accessories**: Balanced stat bonuses\n**🧪 Consumables**: Temporary effects' },
                    { name: '📊 Item Rarity', value: '**Common**: Basic stat bonuses\n**Uncommon**: Moderate bonuses\n**Rare**: Significant bonuses\n**Epic**: Powerful bonuses\n**Legendary**: Game-changing stats' }
                )
                .setFooter({ text: 'Economy tip: Save up for rare equipment - it makes a huge difference in combat!' });
            break;
            
        case 'crews':
            embed = new EmbedBuilder()
                .setColor(config.COLORS.PRIMARY)
                .setTitle('👥 Crew System Guide')
                .setDescription('Unite with other pirates and rule the seas together!')
                .addFields(
                    { name: '🏴‍☠️ Creating a Crew', value: '**`/crew create <name>`** - Found your own crew\n• Become the captain automatically\n• Start recruiting members\n• Build your reputation together' },
                    { name: '📨 Recruitment', value: '**`/crew invite @user`** - Invite pirates (Captain only)\n**`/crew join <name>`** - Join a crew\n**`/crew leave`** - Leave your current crew' },
                    { name: '👑 Crew Roles', value: '**Captain**: Can invite, kick, and manage crew\n**Member**: Participates in crew activities\n• All members contribute to crew stats' },
                    { name: '📈 Crew Benefits', value: '• **Shared Reputation**: Crew achievements\n• **Treasury**: Shared resource pool\n• **Territory Control**: Claim islands\n• **Group Battles**: Future feature' }
                )
                .setFooter({ text: 'Crew tip: A strong crew makes exploration and combat much more rewarding!' });
            break;
            
        case 'treasure':
            embed = new EmbedBuilder()
                .setColor(config.COLORS.TREASURE)
                .setTitle('💎 Treasure Hunting Guide')
                .setDescription('Uncover the hidden riches of the Grand Line!')
                .addFields(
                    { name: '🔍 Treasure Hunting', value: '**`/treasure`** (1min cooldown)\n• 15% base chance to find treasure\n• Higher level = slightly better odds\n• Search different locations for variety' },
                    { name: '💎 Treasure Types', value: '**Common** (Lv 1+): 100-500 Berries\n**Uncommon** (Lv 5+): 500-2,000 Berries\n**Rare** (Lv 15+): 2,000-10,000 Berries\n**Epic** (Lv 30+): 8,000-25,000 Berries' },
                    { name: '🎁 Special Items', value: '**Some treasures contain equipment:**\n• Captain\'s Hat (Accessory)\n• Silver Cutlass (Weapon)\n• Diamond Dagger (Rare Weapon)\n• Admiral\'s Sword (Epic Weapon)' },
                    { name: '🗺️ Location Matters', value: '• Different islands have different treasures\n• Explore new locations for rare finds\n• Some treasures are location-specific' }
                )
                .setFooter({ text: 'Treasure tip: Explore new locations regularly - some treasures are only found in specific places!' });
            break;
            
        default:
            return await showMainHelp(interaction);
    }
    
    await interaction.reply({ embeds: [embed] });
}
