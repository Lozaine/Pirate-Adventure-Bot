import { users, crews, combatSessions, type User, type InsertUser, type Crew, type InsertCrew, type CombatSession, type InsertCombatSession } from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface to maintain compatibility with existing file-based storage
export interface IStorage {
  getUser(discordId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(discordId: string, username: string): Promise<User>;
  updateUser(discordId: string, userData: Partial<User>): Promise<User>;
  
  getCrew(id: number): Promise<Crew | undefined>;
  getCrewByName(name: string): Promise<Crew | undefined>;
  createCrew(name: string, captain: string): Promise<Crew>;
  updateCrew(id: number, crewData: Partial<Crew>): Promise<Crew>;
  
  saveCombatSession(session: InsertCombatSession): Promise<CombatSession>;
  getCombatSession(userId: string): Promise<CombatSession | undefined>;
  deleteCombatSession(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(discordId: string, username: string): Promise<User> {
    const insertUser: InsertUser = {
      discordId,
      username,
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      attack: 20,
      defense: 10,
      berries: 1000,
      devilFruitPower: 0,
      inventory: [],
      equipment: {
        weapon: null,
        armor: null,
        accessory: null
      },
      crewRole: 'member',
      currentLocation: 'East Blue',
      locationsVisited: ['East Blue'],
      wins: 0,
      losses: 0,
      enemiesDefeated: 0,
      allies: [],
      treasuresFound: 0
    };

    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(discordId: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, lastActive: new Date() })
      .where(eq(users.discordId, discordId))
      .returning();
    return user;
  }

  async getCrew(id: number): Promise<Crew | undefined> {
    const [crew] = await db.select().from(crews).where(eq(crews.id, id));
    return crew || undefined;
  }

  async getCrewByName(name: string): Promise<Crew | undefined> {
    const [crew] = await db.select().from(crews).where(eq(crews.name, name));
    return crew || undefined;
  }

  async createCrew(name: string, captain: string): Promise<Crew> {
    const insertCrew: InsertCrew = {
      name,
      captain,
      members: [captain],
      level: 1,
      reputation: 0,
      bounty: 0,
      treasury: 0,
      ships: [],
      territories: [],
      victories: 0,
      treasuresFound: 0,
      locationsDiscovered: []
    };

    const [crew] = await db
      .insert(crews)
      .values(insertCrew)
      .returning();
    return crew;
  }

  async updateCrew(id: number, crewData: Partial<Crew>): Promise<Crew> {
    const [crew] = await db
      .update(crews)
      .set({ ...crewData, lastActive: new Date() })
      .where(eq(crews.id, id))
      .returning();
    return crew;
  }

  async saveCombatSession(session: InsertCombatSession): Promise<CombatSession> {
    // First, delete any existing session for this user
    await this.deleteCombatSession(session.userId);
    
    const [combatSession] = await db
      .insert(combatSessions)
      .values(session)
      .returning();
    return combatSession;
  }

  async getCombatSession(userId: string): Promise<CombatSession | undefined> {
    const [session] = await db.select().from(combatSessions).where(eq(combatSessions.userId, userId));
    return session || undefined;
  }

  async deleteCombatSession(userId: string): Promise<void> {
    await db.delete(combatSessions).where(eq(combatSessions.userId, userId));
  }
}

export const storage = new DatabaseStorage();