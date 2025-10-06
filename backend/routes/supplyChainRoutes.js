const express = require('express');
const router = express.Router();
const { 
  addStage, 
  getProductStages, 
  getProducerStages, 
  getBlockchainStats, 
  verifyBlockchain 
} = require('../controllers/supplyChainController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public: view product stages
router.get('/:product_id', getProductStages);

// Public: get blockchain statistics for a product
router.get('/:product_id/stats', getBlockchainStats);

// Public: verify blockchain integrity
router.get('/:product_id/verify', verifyBlockchain);

// Protected: producers can view their stages across all products
router.get('/producer/my-stages', authMiddleware, roleMiddleware('producer'), getProducerStages);

// Protected: producers and admins can add stages
router.post('/:product_id', authMiddleware, roleMiddleware('producer', 'admin'), addStage);

module.exports = router;
