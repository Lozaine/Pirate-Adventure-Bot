import { EmbedBuilder } from 'discord.js';
import { db } from '../db/index.js';
import { settings } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Logger utility for tracking bot activities and errors
 */
class Logger {
    constructor() {
        this.client = null;
        this.errorChannelId = null;
    }

    /**
     * Initialize the logger with the Discord client
     * @param {import('discord.js').Client} client
     */
    init(client) {
        this.client = client;
        this.loadErrorChannelId();
    }

    /**
     * Load the error channel ID from the database
     */
    async loadErrorChannelId() {
        try {
            const setting = await db.query.settings.findFirst({
                where: eq(settings.key, 'error_log_channel')
            });
            this.errorChannelId = setting?.value || null;
        } catch (error) {
            console.error('[LOGGER] Failed to load error channel ID:', error);
        }
    }

    /**
     * Set the error log channel ID
     * @param {string} channelId
     */
    async setErrorChannel(channelId) {
        try {
            await db.insert(settings)
                .values({ key: 'error_log_channel', value: channelId })
                .onConflictDoUpdate({
                    target: settings.key,
                    set: { value: channelId }
                });
            this.errorChannelId = channelId;
        } catch (error) {
            console.error('[LOGGER] Failed to set error channel:', error);
            throw error;
        }
    }

    /**
     * Log a success event
     * @param {string} event - The event name
     * @param {string} description - Event description
     * @param {Object} metadata - Additional metadata
     */
    async logSuccess(event, description, metadata = {}) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00') // Green
            .setTitle('✅ Success Event')
            .addFields(
                { name: 'Event', value: `\`${event}\``, inline: true },
                { name: 'Description', value: description, inline: false },
                { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setTimestamp();

        // Add metadata fields if provided
        if (Object.keys(metadata).length > 0) {
            const metadataString = '```json\n' + JSON.stringify(metadata, null, 2) + '\n```';
            embed.addFields({ name: 'Metadata', value: metadataString.length > 1024 ? 'Metadata too large to display' : metadataString, inline: false });
        }

        await this.sendToErrorChannel(embed);
        console.log(`[SUCCESS] ${event}: ${description}`);
    }

    /**
     * Log an error event
     * @param {string} event - The event name
     * @param {Error|string} error - The error object or message
     * @param {Object} metadata - Additional metadata
     */
    async logError(event, error, metadata = {}) {
        const errorMessage = error instanceof Error ? error.message : error;
        const errorStack = error instanceof Error ? error.stack : 'No stack trace available';

        const embed = new EmbedBuilder()
            .setColor('#FF0000') // Red
            .setTitle('❌ Error Event')
            .addFields(
                { name: 'Event', value: `\`${event}\``, inline: true },
                { name: 'Error Message', value: `\`\`\`\n${errorMessage}\`\`\``, inline: false },
                { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setTimestamp();

        // Add stack trace (truncated if too long)
        const stackTrace = errorStack.length > 1000 ? errorStack.substring(0, 1000) + '...' : errorStack;
        embed.addFields({ name: 'Stack Trace', value: `\`\`\`\n${stackTrace}\`\`\``, inline: false });

        // Add metadata if provided
        if (Object.keys(metadata).length > 0) {
            const metadataString = '```json\n' + JSON.stringify(metadata, null, 2) + '\n```';
            embed.addFields({ name: 'Metadata', value: metadataString.length > 1024 ? 'Metadata too large to display' : metadataString, inline: false });
        }

        await this.sendToErrorChannel(embed);
        console.error(`[ERROR] ${event}: ${errorMessage}`);
        if (error instanceof Error) {
            console.error(errorStack);
        }
    }

    /**
     * Log a warning event
     * @param {string} event - The event name
     * @param {string} message - Warning message
     * @param {Object} metadata - Additional metadata
     */
    async logWarning(event, message, metadata = {}) {
        const embed = new EmbedBuilder()
            .setColor('#FFA500') // Orange
            .setTitle('⚠️ Warning Event')
            .addFields(
                { name: 'Event', value: `\`${event}\``, inline: true },
                { name: 'Message', value: message, inline: false },
                { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setTimestamp();

        // Add metadata if provided
        if (Object.keys(metadata).length > 0) {
            const metadataString = '```json\n' + JSON.stringify(metadata, null, 2) + '\n```';
            embed.addFields({ name: 'Metadata', value: metadataString.length > 1024 ? 'Metadata too large to display' : metadataString, inline: false });
        }

        await this.sendToErrorChannel(embed);
        console.warn(`[WARNING] ${event}: ${message}`);
    }

    /**
     * Send an embed to the error log channel
     * @param {EmbedBuilder} embed
     */
    async sendToErrorChannel(embed) {
        if (!this.client || !this.errorChannelId) {
            return; // No channel set or client not initialized
        }

        try {
            const channel = await this.client.channels.fetch(this.errorChannelId);
            if (channel && channel.isTextBased()) {
                await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('[LOGGER] Failed to send to error channel:', error);
        }
    }

    /**
     * Get the current error channel ID
     */
    getErrorChannelId() {
        return this.errorChannelId;
    }
}

// Export a singleton instance
export const logger = new Logger();
