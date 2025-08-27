const fs = require('fs').promises;
const path = require('path');

async function updateBotFiles() {
    try {
        console.log('🔧 Updating bot files to use PostgreSQL database...\n');
        
        // List of files that likely import the old database
        const filesToCheck = [
            'index.js',
            'launcher.js',
            'server.js',
            'commands/register.js',
            'commands/profile.js',
            'commands/crew.js',
            'commands/combat.js',
            'commands/explore.js',
            'commands/treasure.js',
            'commands/shop.js',
            'commands/food.js',
            'commands/devilfruit.js',
            'systems/combatSystem.js',
            'systems/crewSystem.js',
            'systems/explorationSystem.js',
            'systems/economySystem.js',
            'systems/foodSystem.js',
            'systems/devilFruitSystem.js'
        ];
        
        let updatedFiles = 0;
        
        for (const filePath of filesToCheck) {
            try {
                const fullPath = path.join(__dirname, '..', filePath);
                const content = await fs.readFile(fullPath, 'utf8');
                
                // Check if file contains old database import
                if (content.includes("require('./database/database')") || 
                    content.includes("require('../database/database')") ||
                    content.includes("require('../../database/database')")) {
                    
                    // Replace the import
                    let newContent = content;
                    newContent = newContent.replace(
                        /require\(['"]\.\/database\/database['"]\)/g,
                        "require('./database/postgresDatabase')"
                    );
                    newContent = newContent.replace(
                        /require\(['"]\.\.\/database\/database['"]\)/g,
                        "require('../database/postgresDatabase')"
                    );
                    newContent = newContent.replace(
                        /require\(['"]\.\.\/\.\.\/database\/database['"]\)/g,
                        "require('../../database/postgresDatabase')"
                    );
                    
                    // Write updated content
                    await fs.writeFile(fullPath, newContent, 'utf8');
                    console.log(`✅ Updated: ${filePath}`);
                    updatedFiles++;
                }
            } catch (error) {
                // File doesn't exist or can't be read, skip it
                continue;
            }
        }
        
        if (updatedFiles > 0) {
            console.log(`\n🎉 Successfully updated ${updatedFiles} files!`);
            console.log('\n📝 Next steps:');
            console.log('1. Test your bot to ensure it connects to PostgreSQL');
            console.log('2. Verify that user data is loading correctly');
            console.log('3. Test basic functionality like user registration');
        } else {
            console.log('ℹ️ No files needed updating (they may already be using the new database)');
        }
        
        console.log('\n🔍 Manual check needed:');
        console.log('Review your main bot file (index.js/launcher.js) to ensure it imports:');
        console.log('const database = require("./database/postgresDatabase");');
        
    } catch (error) {
        console.error('❌ Error updating bot files:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    updateBotFiles()
        .then(() => {
            console.log('\n🎯 Bot files update completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Update failed:', error);
            process.exit(1);
        });
}

module.exports = { updateBotFiles };
