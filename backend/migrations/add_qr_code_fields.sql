-- Add QR code fields to products table
ALTER TABLE products 
ADD COLUMN qr_code_image VARCHAR(255) NULL,
ADD COLUMN qr_code_data TEXT NULL;
