const router = require('express').Router();
const ctrl = require('../controllers/gig.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.get('/',                              ctrl.getGigs);
router.get('/categories',                    ctrl.getCategories);
router.get('/my-gigs',                       protect, authorize('client'), ctrl.getMyGigs);
router.get('/my-bids',                       protect, authorize('freelancer'), ctrl.getMyBids);
router.get('/:id',                           ctrl.getGig);
router.post('/',                             protect, authorize('client','admin'), upload.array('attachments', 5), ctrl.createGig);
router.put('/:id',                           protect, ctrl.updateGig);
router.put('/:id/progress',                  protect, authorize('freelancer'), ctrl.updateProgress);
router.delete('/:id',                        protect, ctrl.deleteGig);

// Bid routes
router.post('/:id/bids',                     protect, authorize('freelancer'), ctrl.placeBid);
router.get('/:id/bids',                      protect, authorize('client','admin'), ctrl.getGigBids);
router.patch('/:id/bids/:bidId/accept',      protect, authorize('client'), ctrl.acceptBid);
router.patch('/:id/bids/:bidId/reject',      protect, authorize('client'), ctrl.rejectBid);

module.exports = router;