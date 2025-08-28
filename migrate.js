import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env file.');
}

// Create a new connection pool.
// We use a separate pool for migrations that we can safely close
// without affecting a potentially running application.
const migrationPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Setting max to 1 ensures we only use one connection for the migration process.
  max: 1,
});

// Create a Drizzle instance for the migration client
const db = drizzle(migrationPool);

async function main() {
  console.log('🚀 Starting database migration...');

  try {
    // This command will run all pending migrations
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('✅ Migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Ensure the connection is closed whether the migration succeeds or fails
    await migrationPool.end();
    console.log('👋 Migration client disconnected.');
  }
}

main();
