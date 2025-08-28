import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

// Check if the database URL is set in the environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env file.');
}

// Create a new connection pool using the standard `pg` driver
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway might require SSL but not reject unauthorized connections.
  // This is a common setup for cloud-hosted PostgreSQL.
  ssl: {
    rejectUnauthorized: false,
  },
});

// Create a Drizzle instance and connect it to the pg pool
// We pass the schema to make it type-safe
// We enable the logger to see the generated SQL queries in the console during development
export const db = drizzle(pool, { schema, logger: true });
