const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));
router.get('/analytics',              ctrl.getAnalytics);
router.get('/users',                  ctrl.getUsers);
router.put('/users/:id/suspend',      ctrl.toggleSuspend);
router.put('/users/:userId/verify',   ctrl.verifyFreelancer);
router.get('/gigs/pending',           ctrl.getPendingGigs);
router.put('/gigs/:id/approve',       ctrl.approveGig);
router.get('/disputes',               ctrl.getDisputes);
router.put('/disputes/:id/resolve',   ctrl.resolveDispute);
router.get('/reviews/flagged',        ctrl.getFlaggedReviews);
router.delete('/reviews/:id',         ctrl.deleteReview);

module.exports = router;
