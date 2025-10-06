const db = require('../db');

const Contact = {
  create: (name, email, subject, message, category, userAgent, ipAddress, callback) => {
    // Try with all columns first, fallback if columns don't exist
    db.query(
      `INSERT INTO contacts (name, email, subject, message, category, user_agent, ip_address, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', NOW())`,
      [name, email, subject || null, message, category || 'general', userAgent || null, ipAddress || null],
      (err, results) => {
        if (err) {
          // If error due to missing columns, try with basic columns only
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            db.query(
              'INSERT INTO contacts (name, email, message, created_at) VALUES (?, ?, ?, NOW())',
              [name, email, message],
              callback
            );
          } else {
            callback(err, results);
          }
        } else {
          callback(err, results);
        }
      }
    );
  },

  getAll: (callback) => {
    db.query(
      `SELECT id, name, email, subject, message, category, status, created_at, updated_at
       FROM contacts 
       ORDER BY created_at DESC`,
      (err, results) => {
        if (err) {
          // Fallback to basic structure if enhanced columns don't exist
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            db.query(
              'SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC',
              callback
            );
          } else {
            callback(err, results);
          }
        } else {
          callback(err, results);
        }
      }
    );
  },

  getById: (id, callback) => {
    db.query(
      `SELECT * FROM contacts WHERE id = ?`,
      [id],
      (err, results) => {
        if (err) {
          // Fallback to basic structure if enhanced columns don't exist
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            db.query('SELECT * FROM contacts WHERE id = ?', [id], callback);
          } else {
            callback(err, results);
          }
        } else {
          callback(err, results);
        }
      }
    );
  },

  updateStatus: (id, status, callback) => {
    db.query(
      'UPDATE contacts SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id],
      (err, results) => {
        if (err) {
          // If updated_at column doesn't exist, try without it
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            db.query('UPDATE contacts SET status = ? WHERE id = ?', [status, id], callback);
          } else {
            callback(err, results);
          }
        } else {
          callback(err, results);
        }
      }
    );
  },

  getByStatus: (status, callback) => {
    db.query(
      `SELECT id, name, email, subject, message, category, status, created_at
       FROM contacts 
       WHERE status = ? 
       ORDER BY created_at DESC`,
      [status],
      (err, results) => {
        if (err) {
          // Fallback if enhanced columns don't exist
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            db.query(
              'SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC',
              callback
            );
          } else {
            callback(err, results);
          }
        } else {
          callback(err, results);
        }
      }
    );
  },

  getStats: (callback) => {
    db.query(
      `SELECT 
        COUNT(*) as total_inquiries,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_inquiries,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_inquiries,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_inquiries,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as this_week_inquiries
       FROM contacts`,
      (err, results) => {
        if (err) {
          // Fallback to basic stats if enhanced columns don't exist
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            db.query('SELECT COUNT(*) as total_inquiries FROM contacts', callback);
          } else {
            callback(err, results);
          }
        } else {
          callback(err, results);
        }
      }
    );
  },

  delete: (id, callback) => {
    db.query('DELETE FROM contacts WHERE id = ?', [id], callback);
  }
};

module.exports = Contact;
