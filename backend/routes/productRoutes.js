const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, getProductsByProducer, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public
router.get('/', getProducts);

// Protected: Get producer's products (must come before /:id route)
router.get('/producer/my-products', authMiddleware, roleMiddleware('producer'), getProductsByProducer);

router.get('/:id', getProductById);

// Protected: Only producers and admins
router.post('/', authMiddleware, roleMiddleware('producer', 'admin'), createProduct);
router.put('/:id', authMiddleware, roleMiddleware('producer', 'admin'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteProduct);

module.exports = router;
