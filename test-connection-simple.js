require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

if (process.env.DATABASE_URL) {
    console.log('URL starts with:', process.env.DATABASE_URL.substring(0, 30) + '...');
    
    // Try to create a pool and test connection
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('Pool created successfully');
        
        // Test the connection
        pool.query('SELECT NOW()', (err, res) => {
            if (err) {
                console.error('Connection test failed:', err.message);
            } else {
                console.log('✅ Connection successful! Current time:', res.rows[0].now);
            }
            pool.end();
        });
        
    } catch (error) {
        console.error('Error creating pool:', error.message);
    }
} else {
    console.log('❌ DATABASE_URL not found in environment');
}
