-- Migration script to add product_image field to products table
-- Run this script on your database to add the image column

ALTER TABLE products 
ADD COLUMN product_image VARCHAR(500);

-- Optional: Add index for better performance
CREATE INDEX idx_products_image ON products(product_image);

