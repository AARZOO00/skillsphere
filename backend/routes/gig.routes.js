// backend/routes/gig.routes.js

const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/gig.controller');

let upload;
try {
  upload = require('../config/cloudinary').upload;
} catch {
  const multer = require('multer');
  upload = multer({ storage: multer.memoryStorage() });
}

// ── IMPORTANT: Specific routes BEFORE /:id ────────────────────

// Public
router.get('/categories', ctrl.getCategories);
router.get('/',           ctrl.getGigs);

// Protected — named routes (must be before /:id)
router.get('/my-gigs', protect, authorize('client', 'admin'), ctrl.getMyGigs);
router.get('/my-bids', protect, authorize('freelancer'),      ctrl.getMyBids);

// Protected — CRUD
router.post('/',             protect, authorize('client', 'admin'), upload.array('attachments', 5), ctrl.createGig);
router.put('/:id',           protect, ctrl.updateGig);
router.put('/:id/progress',  protect, authorize('freelancer'),      ctrl.updateProgress);
router.delete('/:id',        protect, ctrl.deleteGig);

// Public — single gig (after named routes)
router.get('/:id', ctrl.getGigById);

// Bid routes
router.post(  '/:id/bids',                  protect, authorize('freelancer'),     ctrl.placeBid);
router.get(   '/:id/bids',                  protect, authorize('client', 'admin'), ctrl.getBids);
router.patch( '/:id/bids/:bidId/accept',    protect, authorize('client'),          ctrl.acceptBid);
router.patch( '/:id/bids/:bidId/reject',    protect, authorize('client'),          ctrl.rejectBid);

module.exports = router;