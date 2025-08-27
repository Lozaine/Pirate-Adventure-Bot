const database = require('./database/postgresDatabase.js');

async function testDatabase() {
    try {
        console.log('Testing database connection...');
        
        // Initialize database
        await database.initialize();
        console.log('Database initialized successfully');
        
        // Test creating a user
        console.log('\nTesting user creation...');
        const testUserId = 'test_user_123';
        const testUsername = 'TestUser';
        
        const newUser = await database.createUser(testUserId, testUsername);
        if (newUser) {
            console.log('User created successfully:');
            console.log('Raw database result:', JSON.stringify(newUser, null, 2));
            console.log('\nKey fields:');
            console.log('- berries:', newUser.berries, 'type:', typeof newUser.berries);
            console.log('- level:', newUser.level, 'type:', typeof newUser.level);
            console.log('- health:', newUser.health, 'type:', typeof newUser.health);
            console.log('- max_health:', newUser.max_health, 'type:', typeof newUser.max_health);
            console.log('- current_location:', newUser.current_location, 'type:', typeof newUser.current_location);
        } else {
            console.log('Failed to create user');
        }
        
        // Test getting the user
        console.log('\nTesting user retrieval...');
        const retrievedUser = await database.getUser(testUserId);
        if (retrievedUser) {
            console.log('User retrieved successfully:');
            console.log('Raw database result:', JSON.stringify(retrievedUser, null, 2));
            console.log('\nKey fields:');
            console.log('- berries:', retrievedUser.berries, 'type:', typeof retrievedUser.berries);
            console.log('- level:', retrievedUser.level, 'type:', typeof retrievedUser.level);
            console.log('- health:', retrievedUser.health, 'type:', typeof retrievedUser.health);
            console.log('- max_health:', retrievedUser.max_health, 'type:', typeof retrievedUser.max_health);
            console.log('- current_location:', retrievedUser.current_location, 'type:', typeof retrievedUser.current_location);
        } else {
            console.log('Failed to retrieve user');
        }
        
        // Clean up test user
        console.log('\nCleaning up test user...');
        await database.pool.query('DELETE FROM users WHERE discord_id = $1', [testUserId]);
        console.log('Test user deleted');
        
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        // Close the database connection
        if (database.pool) {
            await database.pool.end();
            console.log('Database connection closed');
        }
    }
}

testDatabase();
