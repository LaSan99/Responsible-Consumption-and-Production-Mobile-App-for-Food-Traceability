-- Migration script to add additional fields to products table
-- Run this script on your database to add the new columns

ALTER TABLE products 
ADD COLUMN category VARCHAR(100),
ADD COLUMN origin VARCHAR(255),
ADD COLUMN harvest_date DATE,
ADD COLUMN expiry_date DATE;

-- Optional: Add indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_origin ON products(origin);
CREATE INDEX idx_products_harvest_date ON products(harvest_date);
CREATE INDEX idx_products_expiry_date ON products(expiry_date);
