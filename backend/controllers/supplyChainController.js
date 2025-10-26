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

exports.getProducerProductsWithStages = (req, res) => {
  SupplyChain.getProducerProductsWithStages(req.user.id, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching producer products with stages', error: err });
    }
    
    // Transform flat results into nested structure
    const productsMap = {};
    
    results.forEach(row => {
      if (!productsMap[row.product_id]) {
        productsMap[row.product_id] = {
          id: row.product_id,
          name: row.product_name,
          batch_code: row.batch_code,
          description: row.description,
          category: row.category,
          origin: row.origin,
          harvest_date: row.harvest_date,
          expiry_date: row.expiry_date,
          product_image: row.product_image,
          created_at: row.created_at,
          stages: []
        };
      }
      
      // Add stage if it exists
      if (row.stage_id) {
        productsMap[row.product_id].stages.push({
          id: row.stage_id,
          stage_name: row.stage_name,
          location: row.location,
          timestamp: row.timestamp,
          description: row.stage_description,
          notes: row.notes,
          updated_by_name: row.updated_by_name
        });
      }
    });
    
    // Convert map to array and add stage count
    const productsArray = Object.values(productsMap).map(product => ({
      ...product,
      stageCount: product.stages.length
    }));
    
    // Sort by stage count (products with more stages first)
    productsArray.sort((a, b) => b.stageCount - a.stageCount);
    
    res.json(productsArray);
  });
};
