const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/create-order',  protect, authorize('client'), ctrl.createOrder);
router.post('/verify',        protect, authorize('client'), ctrl.verifyPayment);
router.put('/release/:id',    protect, authorize('client'), ctrl.releasePayment);
router.get('/',               protect, ctrl.getPayments);
router.post('/refund/:id',    protect, authorize('client'), ctrl.requestRefund);

module.exports = router;
