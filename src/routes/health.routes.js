const express = require('express');
const db = require('../db');
const router = express.Router();

// Basic health check endpoint
router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Detailed health check with database status
router.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'disconnected',
  };

  try {
    const result = await db.query('SELECT NOW()');
    if (result.rows.length > 0) {
      health.database = 'connected';
    }
  } catch (err) {
    health.database = 'error: ' + err.message;
    health.status = 'DEGRADED';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
