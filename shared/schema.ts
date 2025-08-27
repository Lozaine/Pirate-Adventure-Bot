import { pgTable, serial, text, integer, boolean, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  discordId: varchar('discord_id', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull(),
  
  // Character stats
  level: integer('level').default(1),
  experience: integer('experience').default(0),
  health: integer('health').default(100),
  maxHealth: integer('max_health').default(100),
  attack: integer('attack').default(20),
  defense: integer('defense').default(10),
  
  // Economy
  berries: integer('berries').default(1000),
  
  // Devil Fruit
  devilFruit: jsonb('devil_fruit'),
  devilFruitPower: integer('devil_fruit_power').default(0),
  
  // Inventory and Equipment
  inventory: jsonb('inventory').default([]),
  equipment: jsonb('equipment').default({
    weapon: null,
    armor: null,
    accessory: null
  }),
  
  // Crew
  crewId: integer('crew_id'),
  crewRole: varchar('crew_role', { length: 50 }).default('member'),
  
  // Exploration
  currentLocation: varchar('current_location', { length: 255 }).default('East Blue'),
  locationsVisited: jsonb('locations_visited').default(['East Blue']),
  
  // Combat stats
  wins: integer('wins').default(0),
  losses: integer('losses').default(0),
  enemiesDefeated: integer('enemies_defeated').default(0),
  
  // Allies found
  allies: jsonb('allies').default([]),
  
  // Treasures found
  treasuresFound: integer('treasures_found').default(0),
  
  // Timestamps
  lastExplore: timestamp('last_explore'),
  lastCombat: timestamp('last_combat'),
  lastTreasure: timestamp('last_treasure'),
  lastDevilFruit: timestamp('last_devil_fruit'),
  
  createdAt: timestamp('created_at').defaultNow(),
  lastActive: timestamp('last_active').defaultNow()
});

// Crews table
export const crews = pgTable('crews', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  captain: varchar('captain', { length: 255 }).notNull(),
  members: jsonb('members').default([]),
  
  // Crew stats
  level: integer('level').default(1),
  reputation: integer('reputation').default(0),
  bounty: integer('bounty').default(0),
  
  // Crew resources
  treasury: integer('treasury').default(0),
  ships: jsonb('ships').default([]),
  territories: jsonb('territories').default([]),
  
  // Crew achievements
  victories: integer('victories').default(0),
  treasuresFound: integer('treasures_found').default(0),
  locationsDiscovered: jsonb('locations_discovered').default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
  lastActive: timestamp('last_active').defaultNow()
});

// Combat sessions table
export const combatSessions = pgTable('combat_sessions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  enemy: jsonb('enemy').notNull(),
  userHealth: integer('user_health').notNull(),
  userMaxHealth: integer('user_max_health').notNull(),
  enemyHealth: integer('enemy_health').notNull(),
  enemyMaxHealth: integer('enemy_max_health').notNull(),
  turn: varchar('turn', { length: 50 }).default('user'),
  moves: jsonb('moves').default([]),
  defendBonus: integer('defend_bonus').default(0),
  status: varchar('status', { length: 50 }).default('active'),
  startTime: timestamp('start_time').defaultNow()
});

// Relations
export const userRelations = relations(users, ({ one }) => ({
  crew: one(crews, {
    fields: [users.crewId],
    references: [crews.id]
  })
}));

export const crewRelations = relations(crews, ({ many }) => ({
  members: many(users)
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Crew = typeof crews.$inferSelect;
export type InsertCrew = typeof crews.$inferInsert;
export type CombatSession = typeof combatSessions.$inferSelect;
export type InsertCombatSession = typeof combatSessions.$inferInsert;