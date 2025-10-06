const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public: Anyone can submit contact inquiries
router.post('/submit', contactController.submitInquiry);

// Protected: Admin-only routes for managing inquiries
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  contactController.getAllInquiries
);

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware('admin'),
  contactController.getInquiryStats
);

router.get(
  '/status/:status',
  authMiddleware,
  roleMiddleware('admin'),
  contactController.getInquiriesByStatus
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  contactController.getInquiryById
);

router.put(
  '/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  contactController.updateInquiryStatus
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  contactController.deleteInquiry
);

module.exports = router;
