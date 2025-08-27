const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../database/postgresDatabase.js');
const config = require('../config.js');
const enemies = require('../data/enemies.js');
const randomizer = require('../utils/randomizer.js');
const foodSystem = require('./foodSystem.js');

class CombatSystem {
    constructor() {
        this.activeCombats = new Map(); // userId -> combat session (in-memory fallback)
        this.useDatabase = process.env.DATABASE_URL ? true : false;
    }

    // Calculate effective combat stats including food buffs
    getEffectiveCombatStats(userData) {
        // Clean up expired buffs and get active food bonuses
        foodSystem.cleanupExpiredBuffs(userData);
        const foodBonuses = foodSystem.calculateFoodBonuses(userData);
        
        return {
            attack: userData.attack + foodBonuses.attack,
            defense: userData.defense + foodBonuses.defense,
            health: userData.health,
            maxHealth: userData.maxHealth
        };
    }

    // Start a new combat session
    async startCombat(userId, enemy) {
        const user = database.getUser(userId);
        if (!user) return null;

        const combatSession = {
            userId: userId,
            enemy: enemy,
            userHealth: user.health,
            userMaxHealth: user.maxHealth,
            enemyHealth: enemy.health,
            enemyMaxHealth: enemy.health,
            turn: 'user',
            moves: [],
            startTime: new Date().toISOString(),
            status: 'active',
            defendBonus: 0 // Accumulates when defending
        };

        this.activeCombats.set(userId, combatSession);

        // Also save to database if available for Railway deployment
        if (this.useDatabase) {
            try {
                const { storage } = require('../server/storage');
                await storage.saveCombatSession({
                    userId: userId,
                    enemy: enemy,
                    userHealth: user.health,
                    userMaxHealth: user.maxHealth,
                    enemyHealth: enemy.health,
                    enemyMaxHealth: enemy.health,
                    turn: 'user',
                    moves: [],
                    defendBonus: 0,
                    status: 'active'
                });
            } catch (error) {
                console.log('[INFO] Using in-memory combat storage (PostgreSQL not available)');
            }
        }

        return combatSession;
    }

    // Get active combat session
    async getActiveCombat(userId) {
        // First check in-memory storage
        let combat = this.activeCombats.get(userId);
        
        // If not found and database is available, check database
        if (!combat && this.useDatabase) {
            try {
                const { storage } = require('../server/storage');
                const dbCombat = await storage.getCombatSession(userId);
                if (dbCombat) {
                    // Convert database format to in-memory format
                    combat = {
                        userId: dbCombat.userId,
                        enemy: dbCombat.enemy,
                        userHealth: dbCombat.userHealth,
                        userMaxHealth: dbCombat.userMaxHealth,
                        enemyHealth: dbCombat.enemyHealth,
                        enemyMaxHealth: dbCombat.enemyMaxHealth,
                        turn: dbCombat.turn,
                        moves: dbCombat.moves || [],
                        startTime: dbCombat.startTime,
                        status: dbCombat.status,
                        defendBonus: dbCombat.defendBonus || 0
                    };
                    // Cache in memory
                    this.activeCombats.set(userId, combat);
                }
            } catch (error) {
                console.log('[INFO] Using in-memory combat storage (PostgreSQL not available)');
            }
        }
        
        return combat;
    }

    // Process combat action
    processCombatAction(userId, action, userData) {
        const combat = this.activeCombats.get(userId);
        if (!combat || combat.status !== 'active') {
            return { success: false, error: 'No active combat session' };
        }

        if (combat.turn !== 'user') {
            return { success: false, error: 'Not your turn!' };
        }

        let result = {};

        switch (action) {
            case 'attack':
                result = this.processAttack(combat, userData);
                break;
            case 'defend':
                result = this.processDefend(combat, userData);
                break;
            case 'special':
                result = this.processSpecial(combat, userData);
                break;
            case 'flee':
                result = this.processFlee(combat, userData);
                break;
            default:
                return { success: false, error: 'Invalid action' };
        }

        // Check if combat is over
        if (combat.enemyHealth <= 0) {
            result.combatEnd = this.endCombat(userId, 'victory', userData);
        } else if (combat.userHealth <= 0) {
            result.combatEnd = this.endCombat(userId, 'defeat', userData);
        } else if (result.fled) {
            result.combatEnd = this.endCombat(userId, 'fled', userData);
        } else {
            // Enemy turn
            const enemyResult = this.processEnemyTurn(combat, userData);
            result.enemyAction = enemyResult;

            // Check again after enemy turn
            if (combat.userHealth <= 0) {
                result.combatEnd = this.endCombat(userId, 'defeat', userData);
            }
        }

        return { success: true, result: result, combat: combat };
    }

    processAttack(combat, userData) {
        const effectiveStats = this.getEffectiveCombatStats(userData);
        const userAttack = effectiveStats.attack + combat.defendBonus;
        const damage = Math.max(1, userAttack - Math.floor(combat.enemy.defense / 2));
        
        combat.enemyHealth = Math.max(0, combat.enemyHealth - damage);
        combat.defendBonus = 0; // Reset defend bonus after attacking
        combat.turn = 'enemy';

        combat.moves.push({
            actor: 'user',
            action: 'attack',
            damage: damage,
            timestamp: new Date().toISOString()
        });

        return {
            action: 'attack',
            damage: damage,
            enemyHealth: combat.enemyHealth,
            critical: damage > userAttack * 0.8
        };
    }

    processDefend(combat, userData) {
        combat.defendBonus += Math.floor(userData.defense / 4); // Build up defense bonus
        combat.turn = 'enemy';

        combat.moves.push({
            actor: 'user',
            action: 'defend',
            defendBonus: combat.defendBonus,
            timestamp: new Date().toISOString()
        });

        return {
            action: 'defend',
            defendBonus: combat.defendBonus,
            message: 'You brace for the enemy\'s attack and prepare a counter-strike!'
        };
    }

    processSpecial(combat, userData) {
        if (!userData.devilFruit) {
            return {
                action: 'special',
                failed: true,
                message: 'You don\'t have a Devil Fruit power to use!'
            };
        }

        const powerLevel = userData.devilFruitPower || 1;
        const effectiveStats = this.getEffectiveCombatStats(userData);
        const specialDamage = Math.floor(effectiveStats.attack * (1 + powerLevel / 50)) + combat.defendBonus;
        const damage = Math.max(1, specialDamage - Math.floor(combat.enemy.defense / 3));

        combat.enemyHealth = Math.max(0, combat.enemyHealth - damage);
        combat.defendBonus = 0;
        combat.turn = 'enemy';

        combat.moves.push({
            actor: 'user',
            action: 'special',
            damage: damage,
            devilFruit: userData.devilFruit.name,
            timestamp: new Date().toISOString()
        });

        return {
            action: 'special',
            damage: damage,
            devilFruit: userData.devilFruit,
            enemyHealth: combat.enemyHealth,
            powerLevel: powerLevel
        };
    }

    processFlee(combat, userData) {
        const fleeChance = 50 + (userData.level * 2); // Higher level = better flee chance
        const success = randomizer.rollPercentage(Math.min(fleeChance, 80));

        if (success) {
            combat.status = 'fled';
            return {
                action: 'flee',
                fled: true,
                message: 'You successfully escaped from the battle!'
            };
        } else {
            combat.turn = 'enemy';
            return {
                action: 'flee',
                fled: false,
                message: 'You couldn\'t escape! The enemy blocks your path!'
            };
        }
    }

    processEnemyTurn(combat, userData) {
        // Simple enemy AI
        const actions = ['attack', 'attack', 'attack', 'defend']; // 75% attack, 25% defend
        const enemyAction = randomizer.getRandomElement(actions);

        if (enemyAction === 'attack') {
            const effectiveStats = this.getEffectiveCombatStats(userData);
            const enemyDamage = Math.max(1, combat.enemy.attack - Math.floor(effectiveStats.defense / 2));
            combat.userHealth = Math.max(0, combat.userHealth - enemyDamage);

            combat.moves.push({
                actor: 'enemy',
                action: 'attack',
                damage: enemyDamage,
                timestamp: new Date().toISOString()
            });

            // Reset turn back to user after enemy attack
            combat.turn = 'user';

            return {
                action: 'attack',
                damage: enemyDamage,
                userHealth: combat.userHealth
            };
        } else {
            combat.moves.push({
                actor: 'enemy',
                action: 'defend',
                timestamp: new Date().toISOString()
            });

            // Reset turn back to user after enemy defend
            combat.turn = 'user';

            return {
                action: 'defend',
                message: `${combat.enemy.name} braces for your next attack!`
            };
        }
    }

    endCombat(userId, result, userData) {
        const combat = this.activeCombats.get(userId);
        if (!combat) return null;

        combat.status = result;
        const endResult = {
            result: result,
            duration: new Date() - new Date(combat.startTime),
            moves: combat.moves.length
        };

        if (result === 'victory') {
            // Calculate rewards
            const berryReward = Math.floor(config.VICTORY_BERRY_BASE * (1 + combat.enemy.level / 10));
            const expReward = Math.floor(config.VICTORY_EXP_BASE * (1 + combat.enemy.level / 5));

            // Apply rewards
            userData.berries += berryReward;
            userData.experience += expReward;
            userData.wins += 1;
            userData.enemiesDefeated += 1;
            userData.health = combat.userHealth; // Update health from combat

            endResult.rewards = {
                berries: berryReward,
                experience: expReward
            };

            // Check for level up
            const expNeeded = Math.floor(config.BASE_EXP_REQUIREMENT * Math.pow(config.EXP_MULTIPLIER, userData.level - 1));
            if (userData.experience >= expNeeded && userData.level < config.MAX_LEVEL) {
                endResult.levelUp = this.levelUpUser(userData);
            }

        } else if (result === 'defeat') {
            userData.losses += 1;
            userData.health = Math.max(1, Math.floor(userData.maxHealth * 0.1)); // Leave with 10% health
            userData.berries = Math.max(0, userData.berries - Math.floor(userData.berries * 0.1)); // Lose 10% berries

            endResult.penalties = {
                healthLoss: userData.maxHealth - userData.health,
                berryLoss: Math.floor(userData.berries * 0.1)
            };
        } else if (result === 'fled') {
            userData.health = combat.userHealth;
            // No major penalties for fleeing
        }

        // Clean up combat session
        this.activeCombats.delete(userId);
        
        return endResult;
    }

    levelUpUser(userData) {
        const oldLevel = userData.level;
        userData.level += 1;
        
        const healthGain = config.HEALTH_PER_LEVEL;
        const attackGain = config.ATTACK_PER_LEVEL;
        const defenseGain = config.DEFENSE_PER_LEVEL;

        userData.maxHealth += healthGain;
        userData.health = userData.maxHealth; // Full heal on level up
        userData.attack += attackGain;
        userData.defense += defenseGain;
        userData.experience = 0; // Reset for next level

        return {
            oldLevel: oldLevel,
            newLevel: userData.level,
            healthGain: healthGain,
            attackGain: attackGain,
            defenseGain: defenseGain
        };
    }

    createCombatEmbed(combat, userData) {
        const userHealthPercent = (combat.userHealth / combat.userMaxHealth) * 100;
        const enemyHealthPercent = (combat.enemyHealth / combat.enemyMaxHealth) * 100;

        const userHealthBar = this.createHealthBar(userHealthPercent);
        const enemyHealthBar = this.createHealthBar(enemyHealthPercent);

        const embed = new EmbedBuilder()
            .setColor(config.COLORS.COMBAT)
            .setTitle(`⚔️ Battle: ${userData.username} vs ${combat.enemy.name}`)
            .setDescription(`Current turn: ${combat.turn === 'user' ? '**Your Turn**' : '**Enemy Turn**'}`)
            .addFields(
                { name: `👤 ${userData.username} (Lv.${userData.level})`, value: `${userHealthBar}\n❤️ ${combat.userHealth}/${combat.userMaxHealth} HP`, inline: true },
                { name: `👹 ${combat.enemy.name} (Lv.${combat.enemy.level})`, value: `${enemyHealthBar}\n❤️ ${combat.enemyHealth}/${combat.enemyMaxHealth} HP`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }
            );

        if (combat.defendBonus > 0) {
            embed.addFields({ name: '🛡️ Defense Bonus', value: `+${combat.defendBonus} damage on next attack!` });
        }

        if (userData.devilFruit) {
            embed.addFields({ name: '🍎 Devil Fruit', value: `${userData.devilFruit.emoji} ${userData.devilFruit.name}` });
        }

        // Show last move
        if (combat.moves.length > 0) {
            const lastMove = combat.moves[combat.moves.length - 1];
            let moveText = '';
            
            if (lastMove.actor === 'user') {
                if (lastMove.action === 'attack') {
                    moveText = `You dealt **${lastMove.damage}** damage!`;
                } else if (lastMove.action === 'defend') {
                    moveText = `You defended and gained **+${lastMove.defendBonus}** damage bonus!`;
                } else if (lastMove.action === 'special') {
                    moveText = `You used **${lastMove.devilFruit}** and dealt **${lastMove.damage}** damage!`;
                }
            } else {
                if (lastMove.action === 'attack') {
                    moveText = `${combat.enemy.name} dealt **${lastMove.damage}** damage to you!`;
                } else if (lastMove.action === 'defend') {
                    moveText = `${combat.enemy.name} defended against your next attack!`;
                }
            }

            if (moveText) {
                embed.addFields({ name: '📜 Last Action', value: moveText });
            }
        }

        return embed;
    }

    createCombatButtons(combat) {
        if (combat.status !== 'active' || combat.turn !== 'user') {
            return [];
        }

        return [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('combat_attack')
                        .setLabel('⚔️ Attack')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('combat_defend')
                        .setLabel('🛡️ Defend')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('combat_special')
                        .setLabel('🔮 Special')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('combat_flee')
                        .setLabel('🏃 Flee')
                        .setStyle(ButtonStyle.Secondary)
                )
        ];
    }

    createHealthBar(percentage) {
        const barLength = 10;
        const filledBars = Math.floor((percentage / 100) * barLength);
        const emptyBars = barLength - filledBars;
        
        let healthEmoji = '🟩';
        if (percentage < 25) healthEmoji = '🟥';
        else if (percentage < 50) healthEmoji = '🟨';
        
        return healthEmoji.repeat(filledBars) + '⬛'.repeat(emptyBars) + ` ${percentage.toFixed(1)}%`;
    }

    // Generate enemy for user's level
    generateEnemyForLevel(userLevel, location = 'East Blue') {
        return enemies.generateEnemyForLevel(userLevel, location);
    }
}

// Create singleton instance
const combatSystem = new CombatSystem();

module.exports = combatSystem;
