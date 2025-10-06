const db = require('../db');

const Certification = {
  create: (name, authority, issuedDate, expiryDate, description, certificateNumber, createdBy, callback) => {
    const query = `
      INSERT INTO certifications (name, authority, issued_date, expiry_date, description, certificate_number, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [name, authority, issuedDate, expiryDate, description || null, certificateNumber || null, createdBy], callback);
  },

  getAll: (callback) => {
    db.query(`
      SELECT c.*, u.full_name as created_by_name 
      FROM certifications c 
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.id DESC
    `, callback);
  },

  getById: (id, callback) => {
    db.query(`
      SELECT c.*, u.full_name as created_by_name 
      FROM certifications c 
      LEFT JOIN users u ON c.created_by = u.id 
      WHERE c.id = ?
    `, [id], callback);
  },

  getByProducer: (producerId, callback) => {
    db.query(`
      SELECT c.*, u.full_name as created_by_name 
      FROM certifications c 
      LEFT JOIN users u ON c.created_by = u.id 
      WHERE c.created_by = ?
      ORDER BY c.id DESC
    `, [producerId], callback);
  },

  update: (id, name, authority, issuedDate, expiryDate, description, certificateNumber, callback) => {
    const query = `
      UPDATE certifications 
      SET name = ?, authority = ?, issued_date = ?, expiry_date = ?, description = ?, certificate_number = ?
      WHERE id = ?
    `;
    db.query(query, [name, authority, issuedDate, expiryDate, description || null, certificateNumber || null, id], callback);
  },

  delete: (id, callback) => {
    // First delete product links
    db.query('DELETE FROM product_certifications WHERE certification_id = ?', [id], (err) => {
      if (err) return callback(err);
      // Then delete the certification
      db.query('DELETE FROM certifications WHERE id = ?', [id], callback);
    });
  },

  linkToProduct: (productId, certificationId, callback) => {
    // Check if already linked
    db.query(
      'SELECT * FROM product_certifications WHERE product_id = ? AND certification_id = ?',
      [productId, certificationId],
      (err, results) => {
        if (err) return callback(err);
        if (results.length > 0) {
          return callback(new Error('Certification already linked to this product'));
        }
        
        // Link the certification
        const query = `
          INSERT INTO product_certifications (product_id, certification_id) 
          VALUES (?, ?)
        `;
        db.query(query, [productId, certificationId], callback);
      }
    );
  },

  unlinkFromProduct: (productId, certificationId, callback) => {
    db.query(
      'DELETE FROM product_certifications WHERE product_id = ? AND certification_id = ?',
      [productId, certificationId],
      callback
    );
  },

  getByProductId: (productId, callback) => {
    const query = `
      SELECT c.*, u.full_name as created_by_name 
      FROM certifications c
      JOIN product_certifications pc ON c.id = pc.certification_id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE pc.product_id = ?
      ORDER BY c.issued_date DESC
    `;
    db.query(query, [productId], callback);
  },

  // Get certification statistics for a producer
  getProducerStats: (producerId, callback) => {
    db.query(`
      SELECT 
        COUNT(*) as total_certifications,
        COUNT(CASE WHEN expiry_date IS NULL OR expiry_date > NOW() THEN 1 END) as active_certifications,
        COUNT(CASE WHEN expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY) AND expiry_date > NOW() THEN 1 END) as expiring_soon
      FROM certifications 
      WHERE created_by = ?
    `, [producerId], callback);
  }
};

module.exports = Certification;
