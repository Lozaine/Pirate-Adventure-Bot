const fs = require('fs').promises;
const path = require('path');

async function cleanupOldDatabase() {
    try {
        console.log('🧹 Cleaning up old database files...\n');
        
        const filesToRemove = [
            'database.js',
            'gamedata.json',
            'schemas.js'
        ];
        
        let removedFiles = 0;
        
        for (const fileName of filesToRemove) {
            try {
                const filePath = path.join(__dirname, '../database', fileName);
                
                // Check if file exists
                await fs.access(filePath);
                
                // Remove file
                await fs.unlink(filePath);
                console.log(`🗑️ Removed: ${fileName}`);
                removedFiles++;
                
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.log(`ℹ️ Skipped: ${fileName} (file not found)`);
                } else {
                    console.error(`❌ Failed to remove ${fileName}:`, error.message);
                }
            }
        }
        
        if (removedFiles > 0) {
            console.log(`\n🎉 Successfully removed ${removedFiles} old database files!`);
            console.log('\n📝 Your bot is now fully migrated to PostgreSQL!');
            console.log('\n⚠️ Important notes:');
            console.log('- Old database files have been removed');
            console.log('- Your bot now uses database/postgresDatabase.js');
            console.log('- All data is stored in your Railway PostgreSQL database');
            console.log('- If you need to rollback, check your backup folder');
        } else {
            console.log('\nℹ️ No files were removed');
        }
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    console.log('⚠️ WARNING: This will permanently remove old database files!');
    console.log('Make sure you have:');
    console.log('1. ✅ Successfully migrated to PostgreSQL');
    console.log('2. ✅ Tested your bot thoroughly');
    console.log('3. ✅ Created a backup (run scripts/backup-old-database.js first)');
    console.log('\nType "YES" to continue with cleanup:');
    
    // Simple confirmation (in production, you might want more robust confirmation)
    process.stdin.once('data', async (data) => {
        const input = data.toString().trim();
        if (input === 'YES') {
            await cleanupOldDatabase();
            process.exit(0);
        } else {
            console.log('❌ Cleanup cancelled');
            process.exit(0);
        }
    });
}

module.exports = { cleanupOldDatabase };
