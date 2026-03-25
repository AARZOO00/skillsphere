const router = require('express').Router();
const ctrl = require('../controllers/proposal.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.post('/gig/:gigId',        protect, authorize('freelancer'), upload.array('attachments', 3), ctrl.submitProposal);
router.get('/gig/:gigId',         protect, ctrl.getProposals);
router.get('/my-proposals',       protect, authorize('freelancer'), ctrl.getMyProposals);
router.put('/:id/status',         protect, authorize('client'), ctrl.updateStatus);
router.post('/:id/negotiate',     protect, ctrl.negotiate);
router.put('/:id/withdraw',       protect, authorize('freelancer'), ctrl.withdrawProposal);

module.exports = router;
