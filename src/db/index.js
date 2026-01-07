const { Pool } = require('pg');

// Create connection pool from DATABASE_URL or individual connection params
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback to individual params if DATABASE_URL not provided
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : process.env.DB_PORT,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
});

// Connection event handlers
pool.on('connect', () => {
  console.log('✓ Database pool connected');
});

pool.on('error', (err) => {
  console.error('✗ Unexpected database pool error:', err.message);
});

// Test connection helper
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✓ Database connection successful');
    console.log(`✓ PostgreSQL version: ${result.rows[0].db_version.split(' ')[1]}`);
    return true;
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    return false;
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection,
};
