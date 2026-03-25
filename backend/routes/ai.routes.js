const router = require('express').Router();
const ctrl = require('../controllers/ai.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/match/:gigId',    protect, authorize('client'), ctrl.matchFreelancers);
router.get('/recommend',       protect, authorize('freelancer'), ctrl.recommendGigs);
router.get('/trending-skills', ctrl.getTrendingSkills);

module.exports = router;
