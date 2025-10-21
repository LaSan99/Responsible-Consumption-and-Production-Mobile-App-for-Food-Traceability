const db = require('../db');

const SupplyChain = {
  addStage: (product_id, stage_name, location, updated_by, description, notes, callback) => {
    // Enhanced blockchain-like stage creation with additional fields
    db.query(
      `INSERT INTO supply_chain (product_id, stage_name, location, updated_by, description, notes, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [product_id, stage_name, location, updated_by, description || null, notes || null],
      (err, results) => {
        if (err) {
          callback(err, null);
        } else {
          // Return the created stage with timestamp for blockchain-like confirmation
          db.query(
            `SELECT sc.*, u.full_name as updated_by_name 
             FROM supply_chain sc 
             JOIN users u ON sc.updated_by = u.id 
             WHERE sc.id = ?`,
            [results.insertId],
            callback
          );
        }
      }
    );
  },

  getStagesByProduct: (product_id, callback) => {
    db.query(
      `SELECT sc.*, u.full_name as updated_by_name 
       FROM supply_chain sc 
       JOIN users u ON sc.updated_by = u.id 
       WHERE sc.product_id = ? 
       ORDER BY sc.timestamp ASC`,
      [product_id],
      callback
    );
  },

  getStagesByBatchCode: (batch_code, callback) => {
    db.query(
      `SELECT sc.*, u.full_name as updated_by_name, p.name as product_name, p.batch_code
       FROM supply_chain sc 
       JOIN products p ON sc.product_id = p.id
       JOIN users u ON sc.updated_by = u.id 
       WHERE p.batch_code = ? 
       ORDER BY sc.timestamp ASC`,
      [batch_code],
      callback
    );
  },

    // Get all stages (for all products)
  getAllStages: (callback) => {
    db.query(
      `SELECT 
         sc.*, 
         p.name AS product_name, 
         u.full_name AS updated_by_name
       FROM supply_chain sc
       JOIN products p ON sc.product_id = p.id
       JOIN users u ON sc.updated_by = u.id
       ORDER BY sc.timestamp DESC`,
      callback
    );
  },


  // Get stages by producer (for their products)
  getStagesByProducer: (producer_id, callback) => {
    db.query(
      `SELECT sc.*, p.name as product_name, u.full_name as updated_by_name 
       FROM supply_chain sc 
       JOIN products p ON sc.product_id = p.id 
       JOIN users u ON sc.updated_by = u.id 
       WHERE p.created_by = ? 
       ORDER BY sc.timestamp DESC`,
      [producer_id],
      callback
    );
  },

  // Get blockchain statistics for a product
  getProductBlockchainStats: (product_id, callback) => {
    db.query(
      `SELECT 
         COUNT(*) as total_stages,
         MIN(timestamp) as first_stage_date,
         MAX(timestamp) as last_stage_date,
         COUNT(DISTINCT updated_by) as unique_contributors
       FROM supply_chain 
       WHERE product_id = ?`,
      [product_id],
      callback
    );
  },

  // Verify blockchain integrity (simulate blockchain verification)
  verifyBlockchainIntegrity: (product_id, callback) => {
    db.query(
      `SELECT id, stage_name, timestamp, updated_by 
       FROM supply_chain 
       WHERE product_id = ? 
       ORDER BY timestamp ASC`,
      [product_id],
      (err, results) => {
        if (err) {
          callback(err, null);
        } else {
          // Simulate blockchain verification by checking chronological order
          let isValid = true;
          for (let i = 1; i < results.length; i++) {
            if (new Date(results[i].timestamp) < new Date(results[i-1].timestamp)) {
              isValid = false;
              break;
            }
          }
          callback(null, { 
            isValid, 
            totalStages: results.length,
            message: isValid ? 'Blockchain integrity verified' : 'Blockchain integrity compromised'
          });
        }
      }
    );
  }
};

module.exports = SupplyChain;
