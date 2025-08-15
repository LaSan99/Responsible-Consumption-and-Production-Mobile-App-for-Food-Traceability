const db = require('../db');

const SupplyChain = {
  addStage: (product_id, stage_name, location, updated_by, callback) => {
    db.query(
      'INSERT INTO supply_chain (product_id, stage_name, location, updated_by) VALUES (?, ?, ?, ?)',
      [product_id, stage_name, location, updated_by],
      callback
    );
  },

  getStagesByProduct: (product_id, callback) => {
    db.query(
      'SELECT * FROM supply_chain WHERE product_id = ? ORDER BY timestamp ASC',
      [product_id],
      callback
    );
  }
};

module.exports = SupplyChain;
