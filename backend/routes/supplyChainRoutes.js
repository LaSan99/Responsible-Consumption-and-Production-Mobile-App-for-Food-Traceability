const express = require('express');
const router = express.Router();
const { addStage, getProductStages } = require('../controllers/supplyChainController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public: view product stages
router.get('/:product_id', getProductStages);

// Protected: producers and admins can add stages
router.post('/:product_id', authMiddleware, roleMiddleware('producer', 'admin'), addStage);

module.exports = router;
