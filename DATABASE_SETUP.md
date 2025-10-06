# Database Setup Instructions

## Issue: 500 Error When Loading Producer Products

The error occurs because the database schema needs to be updated to include the new product fields.

## Solution Options:

### Option 1: Run Database Migration (Recommended)
Execute the following SQL commands on your database:

```sql
-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN category VARCHAR(100),
ADD COLUMN origin VARCHAR(255),
ADD COLUMN harvest_date DATE,
ADD COLUMN expiry_date DATE;

-- Add indexes for better performance (optional)
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_origin ON products(origin);
CREATE INDEX idx_products_harvest_date ON products(harvest_date);
CREATE INDEX idx_products_expiry_date ON products(expiry_date);
```

### Option 2: Backend Will Handle Missing Columns Gracefully
The backend has been updated with fallback logic that will:
1. Try to use the new columns first
2. If columns don't exist, fall back to the basic product structure
3. Return empty strings for missing fields

## How to Apply the Migration:

### For MySQL/MariaDB:
```bash
mysql -u your_username -p your_database_name < backend/migrations/add_product_fields.sql
```

### For SQLite:
```bash
sqlite3 your_database.db < backend/migrations/add_product_fields.sql
```

### Using a Database GUI:
1. Open your database management tool (phpMyAdmin, MySQL Workbench, etc.)
2. Select your food-traceability database
3. Execute the SQL commands from the migration file

## Verification:
After running the migration, the producer products should load without errors and display the additional fields (category, origin, harvest/expiry dates).

## Note:
The backend is now backward-compatible, so it will work both with and without the new columns, but for full functionality, running the migration is recommended.
