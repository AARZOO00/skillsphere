const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.get('/search/freelancers',         ctrl.searchFreelancers);
router.get('/analytics/freelancer',       protect, authorize('freelancer'), ctrl.getFreelancerAnalytics);
router.put('/profile',                    protect, upload.single('avatar'), ctrl.updateProfile);
router.put('/freelancer-profile',         protect, authorize('freelancer'), ctrl.updateFreelancerProfile);
router.post('/portfolio',                 protect, authorize('freelancer'), upload.single('image'), ctrl.addPortfolioItem);
router.post('/experience',                protect, authorize('freelancer'), ctrl.addExperience);
router.put('/availability',               protect, authorize('freelancer'), ctrl.updateAvailability);
router.post('/resume',                    protect, authorize('freelancer'), upload.single('resume'), ctrl.uploadResume);
router.put('/change-password',            protect, ctrl.changePassword);
router.get('/:id/profile',                ctrl.getProfile);

module.exports = router;