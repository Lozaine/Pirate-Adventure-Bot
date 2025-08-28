import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadCommands, registerCommands } from './command-handler.js';

/**
 * Initializes and starts the Discord bot.
 * @returns {Client} The Discord client instance.
 */
export async function startBot() {
  // Check for the Discord token in environment variables
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN environment variable is not set. Please add it to your .env file.');
  }

  // Create a new client instance with necessary intents
  // GatewayIntentBits.Guilds is required for basic bot functionality and slash commands
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
    ],
  });

  // Create a collection to store slash commands
  client.commands = new Collection();

  // Load all command modules from the commands directory
  await loadCommands(client);

  // Event handler for when the client is ready
  // This runs once after the bot successfully logs in
  client.once('ready', async () => {
    console.log(`[INFO] Bot is ready! Logged in as ${client.user.tag}`);
    // Register the loaded commands with Discord's API
    await registerCommands(client);
  });

  // Event handler for interactions (i.e., slash commands)
  client.on('interactionCreate', async (interaction) => {
    // We only care about slash commands (for now)
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    // If the command doesn't exist, log it and inform the user
    if (!command) {
      console.error(`[ERROR] No command matching '${interaction.commandName}' was found.`);
      await interaction.reply({ content: 'This command does not exist.', ephemeral: true });
      return;
    }

    // Try to execute the command
    try {
      // The `execute` function will be defined on each command module
      await command.execute(interaction);
    } catch (error) {
      console.error('[ERROR] An error occurred while executing a command:', error);
      // Inform the user that something went wrong
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  });

  // Login to Discord with the client's token
  client.login(process.env.DISCORD_TOKEN);

  return client;
}
