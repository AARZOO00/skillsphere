const router = require('express').Router();
const passport = require('passport');
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register',         ctrl.register);
router.post('/login',            ctrl.login);
router.get('/verify-email/:token', ctrl.verifyEmail);
router.post('/forgot-password',  ctrl.forgotPassword);
router.put('/reset-password/:token', ctrl.resetPassword);
router.get('/me',                protect, ctrl.getMe);
router.post('/setup-2fa',        protect, ctrl.setup2FA);
router.post('/enable-2fa',       protect, ctrl.enable2FA);
router.post('/disable-2fa',      protect, ctrl.disable2FA);
router.post('/resend-verification', protect, ctrl.resendVerification);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), ctrl.googleCallback);

module.exports = router;
