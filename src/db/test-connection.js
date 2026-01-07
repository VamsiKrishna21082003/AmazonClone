require('dotenv').config();
const db = require('./index');

// Test database connection
async function testDatabaseConnection() {
  console.log('Testing database connection...\n');
  
  try {
    // Test basic connection
    const isConnected = await db.testConnection();
    
    if (isConnected) {
      // Get additional database info
      const dbInfo = await db.query(`
        SELECT 
          current_database() as database_name,
          current_user as user_name,
          inet_server_addr() as server_address,
          inet_server_port() as server_port
      `);
      
      console.log('\n📊 Database Information:');
      console.log('  Database:', dbInfo.rows[0].database_name);
      console.log('  User:', dbInfo.rows[0].user_name);
      console.log('  Server:', dbInfo.rows[0].server_address || 'localhost');
      console.log('  Port:', dbInfo.rows[0].server_port || '5432');
      
      console.log('\n✅ All database tests passed!');
    } else {
      console.log('\n❌ Database connection test failed');
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Error testing database:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  } finally {
    await db.pool.end();
    console.log('\n✓ Connection pool closed');
  }
}

testDatabaseConnection();
