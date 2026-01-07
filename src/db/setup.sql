-- Amazon Clone Database Setup
-- Run this with: psql -U postgres -f src/db/setup.sql

-- Create database
CREATE DATABASE amazon_clone;

-- Connect to the database
\c amazon_clone

-- Verify connection
SELECT 'Database amazon_clone created successfully!' AS status;
SELECT version() AS postgresql_version;
