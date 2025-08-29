import { pgTable, serial, varchar, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Stores the Discord user information.
 * Each user can have multiple characters, though we might only allow one for now.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  discordId: varchar('discord_id', { length: 256 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (users) => {
  return {
    discordIdIndex: uniqueIndex('discord_id_idx').on(users.discordId),
  }
});

/**
 * The main table for player characters.
 * This holds all the choices made during the "Choose Your Destiny" process.
 */
export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 256 }).notNull(),
  race: varchar('race', { length: 50 }).notNull(),
  origin: varchar('origin', { length: 50 }).notNull(),
  faction: varchar('faction', { length: 50 }).notNull(),
  dream: varchar('dream', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Stores the base stats for a character.
 * This is a one-to-one relationship with the characters table.
 */
export const stats = pgTable('stats', {
  id: serial('id').primaryKey(),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }).unique(),
  strength: integer('strength').notNull().default(0),
  agility: integer('agility').notNull().default(0),
  durability: integer('durability').notNull().default(0),
  intelligence: integer('intelligence').notNull().default(0),
});

// --- RELATIONS ---

// A user can have multiple characters
export const usersRelations = relations(users, ({ many }) => ({
  characters: many(characters),
}));

// A character belongs to one user and has one set of stats
export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
  stats: one(stats, {
    fields: [characters.id],
    references: [stats.characterId],
  }),
}));

// Stats belong to one character
export const statsRelations = relations(stats, ({ one }) => ({
  character: one(characters, {
    fields: [stats.characterId],
    references: [characters.id],
  }),
}));

/**
 * Stores bot settings and configuration
 */
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 256 }).notNull().unique(),
  value: varchar('value', { length: 1024 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
