const router = require('express').Router();
const ctrl = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/',               protect, ctrl.createReview);
router.get('/user/:userId',    ctrl.getUserReviews);
router.put('/:id/respond',     protect, ctrl.respondToReview);
router.put('/:id/flag',        protect, ctrl.flagReview);

module.exports = router;
