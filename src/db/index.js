import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

// Check if the database URL is set in the environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env file.');
}

// Create a new Neon client instance
const client = neon(process.env.DATABASE_URL);

// Create a Drizzle instance and connect it to the Neon client
// We pass the schema to make it type-safe
// We enable the logger to see the generated SQL queries in the console during development
export const db = drizzle(client, { schema, logger: true });
