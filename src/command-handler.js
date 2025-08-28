import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

// ES Module equivalents of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dynamically loads all command files from the 'src/commands' directory.
 * @param {import('discord.js').Client} client The Discord client instance to load commands into.
 */
export async function loadCommands(client) {
  client.commands.clear();
  const commandsPath = path.join(__dirname, 'commands');

  // Ensure the commands directory exists
  if (!fs.existsSync(commandsPath)) {
    console.log(`[INFO] Commands directory not found at ${commandsPath}. Creating it.`);
    fs.mkdirSync(commandsPath, { recursive: true });
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = path.toFileUrl(filePath).href; // Convert path to a file URL for dynamic import

    try {
      // Use a cache-busting query param for potential hot-reloading in the future
      const commandModule = await import(`${fileUrl}?t=${Date.now()}`);
      const command = commandModule.default || commandModule; // Handle default exports

      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`[CMD] Loaded command: /${command.data.name}`);
      } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
    }
  }
}

/**
 * Registers all loaded slash commands with the Discord API for a specific guild.
 * @param {import('discord.js').Client} client The Discord client instance containing the loaded commands.
 */
export async function registerCommands(client) {
  const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

  if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error('[ERROR] Cannot register commands. Missing required environment variables: DISCORD_TOKEN, CLIENT_ID, GUILD_ID.');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const commandsData = Array.from(client.commands.values()).map(command => command.data.toJSON());

  if (commandsData.length === 0) {
    console.log('[INFO] No commands to register.');
    return;
  }

  try {
    console.log(`[INFO] Started refreshing ${commandsData.length} application (/) commands for guild: ${GUILD_ID}`);

    // The put method is used to fully refresh all commands in the guild with the current set.
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commandsData },
    );

    console.log(`[INFO] Successfully reloaded ${commandsData.length} application (/) commands.`);
  } catch (error) {
    console.error('[ERROR] Failed to register application commands:', error);
  }
}
