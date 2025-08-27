const { setupDatabase } = require('./setup-database');
const { migrateData } = require('./migrate-data');

async function runFullMigration() {
    try {
        console.log('🚀 Starting full migration to PostgreSQL...\n');
        
        // Step 1: Setup database tables
        console.log('📋 Step 1: Setting up database tables...');
        await setupDatabase();
        console.log('✅ Database tables created successfully!\n');
        
        // Step 2: Migrate existing data
        console.log('📊 Step 2: Migrating existing data...');
        await migrateData();
        console.log('✅ Data migration completed successfully!\n');
        
        console.log('🎉 Full migration completed successfully!');
        console.log('📝 Your One Piece RPG bot is now using PostgreSQL!');
        console.log('\n🔧 Next steps:');
        console.log('1. Update your bot code to use the new postgresDatabase.js');
        console.log('2. Remove the old database.js and gamedata.json files');
        console.log('3. Test your bot to ensure everything works correctly');
        
    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runFullMigration()
        .then(() => {
            console.log('\n🎉 Migration finished!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { runFullMigration };
