const db = require('../db');

const Product = {
  create: (name, batch_code, description, created_by, category, origin, harvest_date, expiry_date, product_image, qr_code_image, qr_code_data, callback) => {
    console.log('Creating product with image:', product_image, 'and QR code:', qr_code_image);
    // First try with new columns including image and QR code
    db.query(
      'INSERT INTO products (name, batch_code, description, created_by, category, origin, harvest_date, expiry_date, product_image, qr_code_image, qr_code_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, batch_code, description, created_by, category || null, origin || null, harvest_date || null, expiry_date || null, product_image || null, qr_code_image || null, qr_code_data || null],
      (err, results) => {
        if (err) {
          console.log('Database insert error:', err);
          // If error due to missing columns, try with basic columns only
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            console.log('Missing columns, trying basic insert');
            db.query(
              'INSERT INTO products (name, batch_code, description, created_by) VALUES (?, ?, ?, ?)',
              [name, batch_code, description, created_by],
              callback
            );
          } else {
            callback(err, results);
          }
        } else {
          console.log('Product created successfully in database');
          callback(err, results);
        }
      }
    );
  },

  getAll: (callback) => {
    // First try with new columns, fallback to old structure if columns don't exist
    db.query(
      `SELECT p.id, p.name, p.batch_code, p.description, 
              COALESCE(p.category, '') as category, 
              COALESCE(p.origin, '') as origin, 
              COALESCE(p.harvest_date, '') as harvest_date, 
              COALESCE(p.expiry_date, '') as expiry_date, 
              COALESCE(p.location, '') as location,
              COALESCE(p.product_image, '') as product_image,
              COALESCE(p.qr_code_image, '') as qr_code_image,
              COALESCE(p.qr_code_data, '') as qr_code_data,
              u.full_name AS created_by_name
       FROM products p
       JOIN users u ON p.created_by = u.id`,
      (err, results) => {
        if (err) {
          // If error due to missing columns, try with basic columns only
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            db.query(
              `SELECT p.id, p.name, p.batch_code, p.location,p.description, u.full_name AS created_by_name
               FROM products p
               JOIN users u ON p.created_by = u.id`,
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
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.log('Error fetching product by ID:', err);
        callback(err, results);
      } else {
        console.log('Product fetched:', results);
        callback(err, results);
      }
    });
  },

  getByProducer: (producerId, callback) => {
    // First try with new columns, fallback to old structure if columns don't exist
    db.query(
      `SELECT p.id, p.name, p.batch_code, p.description, 
              COALESCE(p.category, '') as category, 
              COALESCE(p.origin, '') as origin, 
              COALESCE(p.harvest_date, '') as harvest_date, 
              COALESCE(p.expiry_date, '') as expiry_date, 
              COALESCE(p.product_image, '') as product_image,
              COALESCE(p.qr_code_image, '') as qr_code_image,
              COALESCE(p.qr_code_data, '') as qr_code_data,
              p.created_by, u.full_name AS created_by_name
       FROM products p
       JOIN users u ON p.created_by = u.id
       WHERE p.created_by = ?`,
      [producerId],
      (err, results) => {
        if (err) {
          // If error due to missing columns, try with basic columns only
          if (err.code === 'ER_BAD_FIELD_ERROR') {
            db.query(
              `SELECT p.id, p.name, p.batch_code, p.description, p.created_by, u.full_name AS created_by_name
               FROM products p
               JOIN users u ON p.created_by = u.id
               WHERE p.created_by = ?`,
              [producerId],
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

  update: (id, name, batch_code, description, callback) => {
    db.query(
      'UPDATE products SET name = ?, batch_code = ?, description = ? WHERE id = ?',
      [name, batch_code, description, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query('DELETE FROM products WHERE id = ?', [id], callback);
  }
};

module.exports = Product;
