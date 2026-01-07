# Amazon Clone Backend

Clean architecture Node.js backend for an e-commerce platform.

## Project Structure

```
src/
├── db/             # Database connection and queries
│   ├── index.js    # PostgreSQL pool and helpers
│   └── test-connection.js
├── config/         # Configuration files (deprecated)
├── routes/         # API route definitions
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## Setup

### 1. Install dependencies:
```bash
npm install
```

### 2. Setup PostgreSQL Database:

**Windows (using PowerShell):**
```powershell
# Install PostgreSQL if not already installed
# Download from: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres -c "CREATE DATABASE amazon_clone;"
```

**Linux/Mac:**
```bash
# Install PostgreSQL
sudo apt-get install postgresql  # Ubuntu/Debian
brew install postgresql          # macOS

# Create database
createdb amazon_clone
```

### 3. Configure environment variables:

Edit `.env` file with your database credentials:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amazon_clone
```

### 4. Test database connection:
```bash
npm run test:db
```

### 5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /health` - Basic health check endpoint (returns "OK")
- `GET /health/detailed` - Detailed health check with database status

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run test:db` - Test database connection

## Tech Stack

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client with connection pooling
- **cors** - CORS middleware
- **dotenv** - Environment configuration
