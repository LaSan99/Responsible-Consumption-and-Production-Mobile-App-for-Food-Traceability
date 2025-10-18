const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public: anyone can view certifications
router.get('/', certificationController.getCertifications);
router.get('/:id', certificationController.getCertificationById);
router.get('/product/:productId', certificationController.getProductCertifications);

// Protected: producers can create certifications and view their own
router.post(
  '/', 
  authMiddleware, 
  roleMiddleware('producer', 'admin'), 
  certificationController.createCertification
);

router.get(
  '/producer/my-certifications',
  authMiddleware,
  roleMiddleware('producer'),
  certificationController.getProducerCertifications
);

router.get(
  '/producer/stats',
  authMiddleware,
  roleMiddleware('producer'),
  certificationController.getProducerStats
);

// Protected: only admins can update and delete certifications (or the creator)
router.put(
  '/:id', 
  authMiddleware, 
  roleMiddleware('producer', 'admin'),
  certificationController.updateCertification
);

router.delete(
  '/:id', 
  authMiddleware, 
  roleMiddleware('admin'), 
  certificationController.deleteCertification
);

// Protected: producers and admins can link/unlink certifications to products
router.post(
  '/link/:productId', 
  authMiddleware, 
  roleMiddleware('producer', 'admin'), 
  certificationController.linkCertificationToProduct
);

router.delete(
  '/unlink/:productId/:certificationId',
  authMiddleware,
  roleMiddleware('producer', 'admin'),
  certificationController.unlinkCertificationFromProduct
);

module.exports = router;
