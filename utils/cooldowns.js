class CooldownManager {
    constructor() {
        this.cooldowns = new Map(); // userId -> Map(commandName -> timestamp)
        this.globalCooldowns = new Map(); // commandName -> Map(userId -> timestamp)
        
        // Clean up expired cooldowns every 5 minutes
        setInterval(() => {
            this.cleanup();
        }, 300000);
    }

    // Set a cooldown for a user and command
    setCooldown(userId, commandName, cooldownTime) {
        if (!this.cooldowns.has(userId)) {
            this.cooldowns.set(userId, new Map());
        }

        const userCooldowns = this.cooldowns.get(userId);
        const expiresAt = Date.now() + cooldownTime;
        userCooldowns.set(commandName, expiresAt);

        // Also set in global cooldowns for easier access
        if (!this.globalCooldowns.has(commandName)) {
            this.globalCooldowns.set(commandName, new Map());
        }
        this.globalCooldowns.get(commandName).set(userId, expiresAt);
    }

    // Check if a user is on cooldown for a command
    isOnCooldown(userId, commandName) {
        if (!this.cooldowns.has(userId)) {
            return false;
        }

        const userCooldowns = this.cooldowns.get(userId);
        if (!userCooldowns.has(commandName)) {
            return false;
        }

        const expiresAt = userCooldowns.get(commandName);
        const now = Date.now();

        if (now >= expiresAt) {
            // Cooldown expired, remove it
            userCooldowns.delete(commandName);
            if (this.globalCooldowns.has(commandName)) {
                this.globalCooldowns.get(commandName).delete(userId);
            }
            return false;
        }

        return true;
    }

    // Get remaining cooldown time in milliseconds
    getTimeLeft(userId, commandName) {
        if (!this.isOnCooldown(userId, commandName)) {
            return 0;
        }

        const userCooldowns = this.cooldowns.get(userId);
        const expiresAt = userCooldowns.get(commandName);
        return Math.max(0, expiresAt - Date.now());
    }

    // Get remaining cooldown time in seconds
    getTimeLeftSeconds(userId, commandName) {
        return Math.ceil(this.getTimeLeft(userId, commandName) / 1000);
    }

    // Get formatted cooldown time
    getFormattedTimeLeft(userId, commandName) {
        const timeLeft = this.getTimeLeft(userId, commandName);
        return this.formatTime(timeLeft);
    }

    // Remove a specific cooldown
    removeCooldown(userId, commandName) {
        if (this.cooldowns.has(userId)) {
            this.cooldowns.get(userId).delete(commandName);
        }

        if (this.globalCooldowns.has(commandName)) {
            this.globalCooldowns.get(commandName).delete(userId);
        }
    }

    // Remove all cooldowns for a user
    removeUserCooldowns(userId) {
        if (this.cooldowns.has(userId)) {
            const userCooldowns = this.cooldowns.get(userId);
            
            // Remove from global cooldowns as well
            for (const commandName of userCooldowns.keys()) {
                if (this.globalCooldowns.has(commandName)) {
                    this.globalCooldowns.get(commandName).delete(userId);
                }
            }
            
            this.cooldowns.delete(userId);
        }
    }

    // Get all active cooldowns for a user
    getUserCooldowns(userId) {
        if (!this.cooldowns.has(userId)) {
            return new Map();
        }

        const userCooldowns = this.cooldowns.get(userId);
        const activeCooldowns = new Map();
        const now = Date.now();

        for (const [commandName, expiresAt] of userCooldowns.entries()) {
            if (now < expiresAt) {
                activeCooldowns.set(commandName, expiresAt - now);
            }
        }

        return activeCooldowns;
    }

    // Get cooldown info for a specific command
    getCooldownInfo(userId, commandName) {
        const timeLeft = this.getTimeLeft(userId, commandName);
        const isOnCooldown = timeLeft > 0;

        return {
            isOnCooldown: isOnCooldown,
            timeLeft: timeLeft,
            timeLeftSeconds: Math.ceil(timeLeft / 1000),
            formattedTimeLeft: this.formatTime(timeLeft),
            expiresAt: isOnCooldown ? Date.now() + timeLeft : null
        };
    }

    // Set a global cooldown (affects all users)
    setGlobalCooldown(commandName, cooldownTime) {
        const expiresAt = Date.now() + cooldownTime;
        
        if (!this.globalCooldowns.has(commandName)) {
            this.globalCooldowns.set(commandName, new Map());
        }

        // Set cooldown for all users
        const commandCooldowns = this.globalCooldowns.get(commandName);
        commandCooldowns.set('GLOBAL', expiresAt);
    }

    // Check if there's a global cooldown
    isGlobalCooldown(commandName) {
        if (!this.globalCooldowns.has(commandName)) {
            return false;
        }

        const commandCooldowns = this.globalCooldowns.get(commandName);
        if (!commandCooldowns.has('GLOBAL')) {
            return false;
        }

        const expiresAt = commandCooldowns.get('GLOBAL');
        const now = Date.now();

        if (now >= expiresAt) {
            commandCooldowns.delete('GLOBAL');
            return false;
        }

        return true;
    }

    // Apply cooldown reduction (for premium users, etc.)
    applyCooldownReduction(userId, commandName, reductionPercent) {
        if (!this.cooldowns.has(userId)) {
            return;
        }

        const userCooldowns = this.cooldowns.get(userId);
        if (!userCooldowns.has(commandName)) {
            return;
        }

        const expiresAt = userCooldowns.get(commandName);
        const timeLeft = Math.max(0, expiresAt - Date.now());
        const reducedTime = timeLeft * (1 - reductionPercent / 100);
        const newExpiresAt = Date.now() + reducedTime;

        userCooldowns.set(commandName, newExpiresAt);

        if (this.globalCooldowns.has(commandName)) {
            this.globalCooldowns.get(commandName).set(userId, newExpiresAt);
        }
    }

    // Get statistics about cooldowns
    getStats() {
        let totalUsers = this.cooldowns.size;
        let totalCooldowns = 0;
        let commandStats = new Map();

        for (const [userId, userCooldowns] of this.cooldowns.entries()) {
            totalCooldowns += userCooldowns.size;
            
            for (const commandName of userCooldowns.keys()) {
                commandStats.set(commandName, (commandStats.get(commandName) || 0) + 1);
            }
        }

        return {
            totalUsers: totalUsers,
            totalCooldowns: totalCooldowns,
            commandStats: Object.fromEntries(commandStats),
            averageCooldownsPerUser: totalUsers > 0 ? totalCooldowns / totalUsers : 0
        };
    }

    // Clean up expired cooldowns
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        // Clean user cooldowns
        for (const [userId, userCooldowns] of this.cooldowns.entries()) {
            const expiredCommands = [];
            
            for (const [commandName, expiresAt] of userCooldowns.entries()) {
                if (now >= expiresAt) {
                    expiredCommands.push(commandName);
                }
            }

            for (const commandName of expiredCommands) {
                userCooldowns.delete(commandName);
                cleanedCount++;
            }

            // Remove empty user cooldown maps
            if (userCooldowns.size === 0) {
                this.cooldowns.delete(userId);
            }
        }

        // Clean global cooldowns
        for (const [commandName, commandCooldowns] of this.globalCooldowns.entries()) {
            const expiredUsers = [];
            
            for (const [userId, expiresAt] of commandCooldowns.entries()) {
                if (now >= expiresAt) {
                    expiredUsers.push(userId);
                }
            }

            for (const userId of expiredUsers) {
                commandCooldowns.delete(userId);
            }

            // Remove empty command cooldown maps
            if (commandCooldowns.size === 0) {
                this.globalCooldowns.delete(commandName);
            }
        }

        if (cleanedCount > 0) {
            console.log(`[COOLDOWN] Cleaned up ${cleanedCount} expired cooldowns`);
        }
    }

    // Format time duration
    formatTime(milliseconds) {
        if (milliseconds <= 0) return '0s';

        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Check multiple cooldowns at once
    checkMultipleCooldowns(userId, commandNames) {
        const results = {};
        
        for (const commandName of commandNames) {
            results[commandName] = this.getCooldownInfo(userId, commandName);
        }

        return results;
    }

    // Set multiple cooldowns at once
    setMultipleCooldowns(userId, cooldowns) {
        for (const [commandName, cooldownTime] of Object.entries(cooldowns)) {
            this.setCooldown(userId, commandName, cooldownTime);
        }
    }

    // Get the longest cooldown for a user
    getLongestCooldown(userId) {
        const userCooldowns = this.getUserCooldowns(userId);
        let longestTime = 0;
        let longestCommand = null;

        for (const [commandName, timeLeft] of userCooldowns.entries()) {
            if (timeLeft > longestTime) {
                longestTime = timeLeft;
                longestCommand = commandName;
            }
        }

        return {
            command: longestCommand,
            timeLeft: longestTime,
            formattedTimeLeft: this.formatTime(longestTime)
        };
    }

    // Export cooldown data (for persistence)
    exportData() {
        const data = {
            cooldowns: {},
            globalCooldowns: {},
            exportedAt: Date.now()
        };

        // Convert Maps to objects for serialization
        for (const [userId, userCooldowns] of this.cooldowns.entries()) {
            data.cooldowns[userId] = Object.fromEntries(userCooldowns);
        }

        for (const [commandName, commandCooldowns] of this.globalCooldowns.entries()) {
            data.globalCooldowns[commandName] = Object.fromEntries(commandCooldowns);
        }

        return data;
    }

    // Import cooldown data (for persistence)
    importData(data) {
        if (!data || typeof data !== 'object') return;

        const now = Date.now();

        // Import user cooldowns
        if (data.cooldowns) {
            for (const [userId, userCooldowns] of Object.entries(data.cooldowns)) {
                if (typeof userCooldowns !== 'object') continue;

                const userCooldownMap = new Map();
                for (const [commandName, expiresAt] of Object.entries(userCooldowns)) {
                    // Only import cooldowns that haven't expired
                    if (expiresAt > now) {
                        userCooldownMap.set(commandName, expiresAt);
                    }
                }

                if (userCooldownMap.size > 0) {
                    this.cooldowns.set(userId, userCooldownMap);
                }
            }
        }

        // Import global cooldowns
        if (data.globalCooldowns) {
            for (const [commandName, commandCooldowns] of Object.entries(data.globalCooldowns)) {
                if (typeof commandCooldowns !== 'object') continue;

                const commandCooldownMap = new Map();
                for (const [userId, expiresAt] of Object.entries(commandCooldowns)) {
                    // Only import cooldowns that haven't expired
                    if (expiresAt > now) {
                        commandCooldownMap.set(userId, expiresAt);
                    }
                }

                if (commandCooldownMap.size > 0) {
                    this.globalCooldowns.set(commandName, commandCooldownMap);
                }
            }
        }

        console.log('[COOLDOWN] Imported cooldown data');
    }
}

// Create singleton instance
const cooldownManager = new CooldownManager();

module.exports = cooldownManager;
