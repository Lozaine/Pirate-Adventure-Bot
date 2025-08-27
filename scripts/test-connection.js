const { Pool } = require('pg');

async function testConnection() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🔌 Testing PostgreSQL connection...');
        
        // Test basic connection
        const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
        console.log('✅ Connection successful!');
        console.log(`🕐 Current time: ${result.rows[0].current_time}`);
        console.log(`📊 Database version: ${result.rows[0].db_version.split(' ')[0]}`);
        
        // Test if tables exist
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length > 0) {
            console.log('\n📋 Existing tables:');
            tablesResult.rows.forEach(row => {
                console.log(`  - ${row.table_name}`);
            });
        } else {
            console.log('\n📋 No tables found yet. Run the migration script first!');
        }
        
        console.log('\n🎉 Database connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('💡 Tip: Check if your DATABASE_URL is correct');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 Tip: Check if your database is running and accessible');
        } else if (error.code === '28P01') {
            console.log('💡 Tip: Check your database username and password');
        }
        
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable is not set!');
        console.log('💡 Make sure to set your Railway PostgreSQL connection string');
        process.exit(1);
    }
    
    testConnection()
        .then(() => {
            console.log('\n🎯 Ready to run migration!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testConnection };
