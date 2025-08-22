const db = require('../db');

const Certification = {
  create: (name, authority, issuedDate, expiryDate, callback) => {
    const query = `
      INSERT INTO certifications (name, authority, issued_date, expiry_date) 
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [name, authority, issuedDate, expiryDate], callback);
  },

  getAll: (callback) => {
    db.query('SELECT * FROM certifications', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM certifications WHERE id = ?', [id], callback);
  },

  update: (id, name, authority, issuedDate, expiryDate, callback) => {
    const query = `
      UPDATE certifications 
      SET name = ?, authority = ?, issued_date = ?, expiry_date = ?
      WHERE id = ?
    `;
    db.query(query, [name, authority, issuedDate, expiryDate, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM certifications WHERE id = ?', [id], callback);
  },

  linkToProduct: (productId, certificationId, callback) => {
    const query = `
      INSERT INTO product_certifications (product_id, certification_id) 
      VALUES (?, ?)
    `;
    db.query(query, [productId, certificationId], callback);
  },

  getByProductId: (productId, callback) => {
    const query = `
      SELECT c.* 
      FROM certifications c
      JOIN product_certifications pc ON c.id = pc.certification_id
      WHERE pc.product_id = ?
    `;
    db.query(query, [productId], callback);
  }
};

module.exports = Certification;
