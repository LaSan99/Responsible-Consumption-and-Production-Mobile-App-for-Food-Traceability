const SupplyChain = require('../models/supplyChainModel');

exports.addStage = (req, res) => {
  const { stage_name, location } = req.body;
  const { product_id } = req.params;

  if (!stage_name) return res.status(400).json({ message: 'Stage name required' });

  SupplyChain.addStage(product_id, stage_name, location, req.user.id, (err) => {
    if (err) return res.status(500).json({ message: 'Error adding stage', error: err });
    res.json({ message: 'Stage added' });
  });
};

exports.getProductStages = (req, res) => {
  const { product_id } = req.params;
  SupplyChain.getStagesByProduct(product_id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching stages' });
    res.json(results);
  });
};
