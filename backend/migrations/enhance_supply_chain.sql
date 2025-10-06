-- Migration script to enhance supply_chain table for blockchain functionality
-- Run this script on your database to add the new columns

ALTER TABLE supply_chain 
ADD COLUMN description TEXT,
ADD COLUMN notes TEXT;

-- Update existing records to have proper timestamps if needed
-- (This assumes your current table already has a timestamp column)

-- Optional: Add indexes for better performance
CREATE INDEX idx_supply_chain_product_timestamp ON supply_chain(product_id, timestamp);
CREATE INDEX idx_supply_chain_updated_by ON supply_chain(updated_by);

-- If you don't have a timestamp column yet, add it:
-- ALTER TABLE supply_chain ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
