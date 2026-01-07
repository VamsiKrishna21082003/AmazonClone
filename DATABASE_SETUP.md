# PostgreSQL Database Setup Guide

## Installation

### Windows

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL installer (version 14 or higher recommended)
   - Run the installer

2. **During Installation:**
   - Remember the password you set for the `postgres` user
   - Default port: 5432
   - Install pgAdmin (optional, for GUI management)

3. **Add PostgreSQL to PATH:**
   - Add `C:\Program Files\PostgreSQL\<version>\bin` to your system PATH
   - Restart your terminal

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS

```bash
brew install postgresql
brew services start postgresql
```

## Database Creation

### Option 1: Using psql Command Line

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE amazon_clone;

# Verify
\l

# Exit
\q
```

### Option 2: Using SQL File

We've provided a setup script:

```bash
psql -U postgres -f src/db/setup.sql
```

### Option 3: Using PowerShell (Windows)

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE amazon_clone;"

# Test connection
psql -U postgres -d amazon_clone -c "SELECT version();"
```

## Configuration

Update your `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/amazon_clone
```

Or use individual parameters:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amazon_clone
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
```

## Verify Connection

Test the database connection:

```bash
npm run test:db
```

Expected output:
```
✓ Database connection successful
✓ PostgreSQL version: 14.x
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL service is running
- Check if port 5432 is open
- Verify firewall settings

### Authentication Failed
- Double-check username and password in `.env`
- Verify user has proper permissions

### Database Does Not Exist
- Create the database using one of the methods above
- Ensure the database name matches your `.env` configuration

### PostgreSQL Not Found
- Verify PostgreSQL is installed: `psql --version`
- Check if PostgreSQL bin directory is in your PATH
