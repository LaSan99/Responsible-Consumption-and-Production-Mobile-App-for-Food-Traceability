const SupplyChain = require('../models/supplyChainModel');

exports.addStage = (req, res) => {
  const { stage_name, location, description, notes } = req.body;
  const { product_id } = req.params;

  if (!stage_name) return res.status(400).json({ message: 'Stage name required' });
  if (!location) return res.status(400).json({ message: 'Location required' });

  SupplyChain.addStage(product_id, stage_name, location, req.user.id, description, notes, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error adding blockchain stage', error: err });
    
    // Return the created stage data for blockchain confirmation
    res.json({ 
      message: 'Blockchain stage added successfully',
      stage: results[0],
      blockHash: `${results[0].id}${results[0].timestamp}`.slice(-8).toUpperCase()
    });
  });
};

exports.getAllStages = (req, res) => {
  SupplyChain.getAllStages((err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching all blockchain stages', error: err });
    }
    res.json(results);
  });
};


exports.getProductStages = (req, res) => {
  const { product_id } = req.params;
  SupplyChain.getStagesByProduct(product_id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching blockchain stages' });
    res.json(results);
  });
};

exports.getStagesByBatchCode = (req, res) => {
  const { batch_code } = req.params;
  SupplyChain.getStagesByBatchCode(batch_code, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error fetching blockchain stages', 
        error: err 
      });
    }
    
    // Product not found in database
    if (results.productNotFound) {
      return res.status(404).json({ 
        message: 'No product found with this batch code',
        productNotFound: true
      });
    }
    
    // Product exists but has no stages
    if (results.noStages) {
      return res.status(200).json({ 
        message: 'Product found but no supply chain stages recorded yet',
        product: results.product,
        stages: [],
        noStages: true
      });
    }
    
    // Product exists with stages
    res.json(results.stages);
  });
};

exports.getProducerStages = (req, res) => {
  SupplyChain.getStagesByProducer(req.user.id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching producer stages' });
    res.json(results);
  });
};

exports.getBlockchainStats = (req, res) => {
  const { product_id } = req.params;
  SupplyChain.getProductBlockchainStats(product_id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching blockchain statistics' });
    res.json(results[0]);
  });
};

exports.verifyBlockchain = (req, res) => {
  const { product_id } = req.params;
  SupplyChain.verifyBlockchainIntegrity(product_id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error verifying blockchain integrity' });
    res.json(results);
  });
};
