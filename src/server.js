require('dotenv').config();
const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 5000;

// Initialize server
const startServer = async () => {
  // Test database connection
  await db.testConnection();

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    server.close(async () => {
      await db.pool.end();
      console.log('✓ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

// Start the application
startServer().catch((err) => {
  console.error('✗ Failed to start server:', err.message);
  process.exit(1);
});
