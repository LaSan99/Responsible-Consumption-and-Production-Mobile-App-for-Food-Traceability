const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public: anyone can view certifications
router.get('/', certificationController.getCertifications);
router.get('/:id', certificationController.getCertificationById);
router.get('/product/:productId', certificationController.getProductCertifications);

// Protected: only admins can create, update, delete certifications
router.post(
  '/', 
  authMiddleware, 
  roleMiddleware('admin'), 
  certificationController.createCertification
);

router.put(
  '/:id', 
  authMiddleware, 
  roleMiddleware('admin'), 
  certificationController.updateCertification
);

router.delete(
  '/:id', 
  authMiddleware, 
  roleMiddleware('admin'), 
  certificationController.deleteCertification
);

// Protected: producers and admins can link certifications to products
router.post(
  '/link/:productId', 
  authMiddleware, 
  roleMiddleware('producer', 'admin'), 
  certificationController.linkCertificationToProduct
);

module.exports = router;
