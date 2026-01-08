# Database Setup Guide

## Complete Database Setup (Step-by-Step)

Follow these steps in order to set up the Amazon Clone database:

### Prerequisites
- PostgreSQL installed and running
- `psql` command available in your PATH

### Step 1: Ensure PostgreSQL is Running

Windows (check service):
```powershell
Get-Service postgresql*
```

If not running:
```powershell
Start-Service postgresql-x64-18
```

### Step 2: Create Database (if not already created)

```powershell
psql -U postgres -c "CREATE DATABASE amazon_clone;"
```

If database already exists, you'll see "already exists" error - that's OK!

### Step 3: Create Database Schema (Tables)

This creates all tables and inserts sample products:

```powershell
psql -U postgres -d amazon_clone -f src/db/schema.sql
```

**Expected output:**
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
INSERT 0 5
INSERT 0 10
INSERT 0 16
SELECT 1
```

### Step 4: Add Product Images

Now add images to the products:

```powershell
psql -U postgres -d amazon_clone -f ADD_PRODUCT_IMAGES.sql
```

**Expected output:**
```
INSERT 0 3
INSERT 0 1
INSERT 0 2
...
(Shows product list with image counts)
```

### Step 5: Verify Setup

Check if tables were created:

```powershell
psql -U postgres -d amazon_clone -c "\dt"
```

**Expected output:**
```
 Schema |     Name       | Type  |  Owner
--------+----------------+-------+----------
 public | cart           | table | postgres
 public | categories     | table | postgres
 public | order_items    | table | table | postgres
 public | orders         | table | postgres
 public | product_images | table | postgres
 public | products       | table | postgres
```

Check products and images:

```powershell
psql -U postgres -d amazon_clone -c "SELECT p.id, p.name, COUNT(pi.id) as image_count FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id GROUP BY p.id, p.name ORDER BY p.id;"
```

### Troubleshooting

#### Error: "database does not exist"
Solution:
```powershell
psql -U postgres -c "CREATE DATABASE amazon_clone;"
```

#### Error: "relation product_images does not exist"
Solution: You skipped Step 3. Run the schema file first:
```powershell
psql -U postgres -d amazon_clone -f src/db/schema.sql
```

#### Error: "permission denied" or "password authentication failed"
Solution: Make sure you're using the correct PostgreSQL password. You may need to:
1. Update your `.env` file with the correct password
2. Reset your postgres password (see DATABASE_SETUP.md)

#### Want to Start Fresh?
Drop and recreate database:
```powershell
psql -U postgres -c "DROP DATABASE IF EXISTS amazon_clone;"
psql -U postgres -c "CREATE DATABASE amazon_clone;"
psql -U postgres -d amazon_clone -f src/db/schema.sql
psql -U postgres -d amazon_clone -f ADD_PRODUCT_IMAGES.sql
```

### After Setup Complete

1. Start backend server:
   ```powershell
   npm run dev
   ```

2. Start frontend (in another terminal):
   ```powershell
   cd frontendnew
   npm run dev
   ```

3. Open browser: http://localhost:5173

You should now see products with images!
