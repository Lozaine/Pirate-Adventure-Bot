const fs = require('fs').promises;
const path = require('path');

async function backupOldDatabase() {
    try {
        console.log('💾 Creating backup of old database files...\n');
        
        const backupDir = path.join(__dirname, '../database/backup_' + new Date().toISOString().replace(/[:.]/g, '-'));
        await fs.mkdir(backupDir, { recursive: true });
        
        const filesToBackup = [
            'database.js',
            'gamedata.json',
            'schemas.js'
        ];
        
        let backedUpFiles = 0;
        
        for (const fileName of filesToBackup) {
            try {
                const sourcePath = path.join(__dirname, '../database', fileName);
                const backupPath = path.join(backupDir, fileName);
                
                // Check if file exists
                await fs.access(sourcePath);
                
                // Copy file to backup
                await fs.copyFile(sourcePath, backupPath);
                console.log(`✅ Backed up: ${fileName}`);
                backedUpFiles++;
                
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.log(`ℹ️ Skipped: ${fileName} (file not found)`);
                } else {
                    console.error(`❌ Failed to backup ${fileName}:`, error.message);
                }
            }
        }
        
        if (backedUpFiles > 0) {
            console.log(`\n🎉 Successfully backed up ${backedUpFiles} files to: ${backupDir}`);
            console.log('\n📝 Next steps:');
            console.log('1. Run the migration: node scripts/migrate-to-postgres.js');
            console.log('2. Test your bot thoroughly');
            console.log('3. Once confirmed working, you can safely remove old files');
            console.log(`4. Backup is stored in: ${backupDir}`);
        } else {
            console.log('\nℹ️ No files were backed up');
        }
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    backupOldDatabase()
        .then(() => {
            console.log('\n🎯 Backup completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Backup failed:', error);
            process.exit(1);
        });
}

module.exports = { backupOldDatabase };
