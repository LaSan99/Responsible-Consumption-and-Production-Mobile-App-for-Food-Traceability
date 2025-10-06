-- Migration script to enhance certifications table for producer functionality
-- Run this script on your database to add the new columns

ALTER TABLE certifications 
ADD COLUMN description TEXT,
ADD COLUMN certificate_number VARCHAR(255),
ADD COLUMN created_by INT,
ADD FOREIGN KEY (created_by) REFERENCES users(id);

-- Optional: Add indexes for better performance
CREATE INDEX idx_certifications_created_by ON certifications(created_by);
CREATE INDEX idx_certifications_authority ON certifications(authority);
CREATE INDEX idx_certifications_expiry_date ON certifications(expiry_date);

-- If you need to handle existing certifications without created_by, you can set them to NULL
-- UPDATE certifications SET created_by = NULL WHERE created_by IS NULL;
