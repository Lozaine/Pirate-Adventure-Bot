/*
 Local dry-run boot script:
 - Loads config
 - Initializes/shuts down the database
 - Loads all commands and validates export shape
 - Builds slash command JSON to catch builder errors
 - Does NOT connect to Discord
*/

const fs = require('fs');
const path = require('path');

async function main() {
    const projectRoot = path.resolve(__dirname, '..');
    const rel = (...p) => path.join(projectRoot, ...p);

    // Load config (token not used here)
    const config = require(rel('config.js'));

    // Initialize database
    const database = require(rel('database', 'database.js'));
    await database.initialize();

    // Load commands
    const commandsDir = rel('commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    const results = [];
    let ok = 0;
    let bad = 0;

    for (const file of commandFiles) {
        const filePath = path.join(commandsDir, file);
        try {
            const mod = require(filePath);
            const hasData = !!mod && !!mod.data && typeof mod.data.toJSON === 'function';
            const hasExecute = !!mod && typeof mod.execute === 'function';
            let built = null;
            if (hasData) {
                try {
                    built = mod.data.toJSON();
                } catch (e) {
                    results.push({ file, error: `data.toJSON failed: ${e.message}` });
                    bad++;
                    continue;
                }
            }
            if (!hasData || !hasExecute) {
                results.push({ file, error: (!hasData && !hasExecute) ? 'missing data and execute' : (!hasData ? 'missing data' : 'missing execute') });
                bad++;
            } else {
                ok++;
                results.push({ file, name: built?.name || mod.data?.name || path.basename(file, '.js'), subcommands: built?.options?.map(o => o.name).filter(Boolean) || [] });
            }
        } catch (e) {
            results.push({ file, error: `require failed: ${e.message}` });
            bad++;
        }
    }

    // Shut down database to flush data and stop timers
    if (database && typeof database.shutdown === 'function') {
        await database.shutdown();
    }

    const summary = {
        ok,
        bad,
        total: commandFiles.length,
        commandsDir,
        node: process.version,
    };

    // Print concise summary and detailed results
    console.log('[DRY-RUN] Summary:', JSON.stringify(summary));
    console.log('[DRY-RUN] Results:', JSON.stringify(results, null, 2));
}

main().catch(err => {
    console.error('[DRY-RUN] Fatal error:', err);
    process.exit(1);
});


