import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadCommands, registerCommands } from './command-handler.js';
import { logger } from './utils/logger.js';

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
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
    ],
  });

  // Create a collection to store slash commands
  client.commands = new Collection();

  // Initialize the logger with the client
  logger.init(client);

  // Load all command modules from the commands directory
  await loadCommands(client);

  // Event handler for when the client is ready
  client.once('clientReady', async () => {
    console.log(`[INFO] Bot is ready! Logged in as ${client.user.tag}`);

    // Log successful bot startup
    await logger.logSuccess('Bot Startup', `Bot successfully logged in as ${client.user.tag}`, {
      botId: client.user.id,
      guildCount: client.guilds.cache.size
    });

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

      await logger.logError('Command Not Found', `Command '${interaction.commandName}' was not found`, {
        commandName: interaction.commandName,
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId
      });

      await interaction.reply({ content: 'This command does not exist.', ephemeral: true });
      return;
    }

    // Try to execute the command
    try {
      // Log command usage
      await logger.logSuccess('Command Executed', `Command '${interaction.commandName}' executed successfully`, {
        commandName: interaction.commandName,
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        channelId: interaction.channelId
      });

      // The `execute` function will be defined on each command module
      await command.execute(interaction);
    } catch (error) {
      console.error('[ERROR] An error occurred while executing a command:', error);

      // Log the command execution error
      await logger.logError('Command Execution Error', error, {
        commandName: interaction.commandName,
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        channelId: interaction.channelId
      });

      // Inform the user that something went wrong
      const errorMessage = 'There was an error while executing this command!';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  });

  // Log unhandled errors
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await logger.logError('Unhandled Rejection', reason, {
      promiseLocation: promise.toString()
    });
  });

  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await logger.logError('Uncaught Exception', error);
    // Don't exit the process in production, but you might want to in development
    // process.exit(1);
  });

  // Login to Discord with the client's token
  client.login(process.env.DISCORD_TOKEN);

  return client;
}
