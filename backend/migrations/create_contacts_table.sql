-- Migration script to create contacts table for handling consumer inquiries
-- Run this script on your database to create the contacts table

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  category ENUM('general', 'technical', 'feedback', 'report') DEFAULT 'general',
  status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_category ON contacts(category);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Insert some sample data (optional)
INSERT INTO contacts (name, email, subject, message, category, status) VALUES
('John Doe', 'john@example.com', 'Product Inquiry', 'I would like to know more about your organic vegetables.', 'general', 'new'),
('Jane Smith', 'jane@example.com', 'Technical Issue', 'The QR scanner is not working properly on my device.', 'technical', 'in_progress'),
('Bob Johnson', 'bob@example.com', 'Great App!', 'Love the traceability features. Keep up the good work!', 'feedback', 'resolved');
