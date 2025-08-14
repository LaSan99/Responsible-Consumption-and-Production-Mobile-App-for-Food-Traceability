const db = require('../db');

const Product = {
  create: (name, batch_code, description, created_by, callback) => {
    db.query(
      'INSERT INTO products (name, batch_code, description, created_by) VALUES (?, ?, ?, ?)',
      [name, batch_code, description, created_by],
      callback
    );
  },

  getAll: (callback) => {
    db.query('SELECT * FROM products', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], callback);
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
