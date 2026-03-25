const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment.model');
const Gig = require('../models/Gig.model');
const Freelancer = require('../models/Freelancer.model');
const Notification = require('../models/Notification.model');

const PLATFORM_FEE = 10;

exports.createOrder = async (req, res) => {
  try {
    const { gigId, milestoneIndex, amount } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (!gig.assignedFreelancer) return res.status(400).json({ success: false, message: 'No freelancer assigned yet' });

    const platformFee = Math.round(amount * PLATFORM_FEE / 100);
    const freelancerAmount = amount - platformFee;
    const mockOrderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const payment = await Payment.create({
      gig: gigId,
      client: req.user._id,
      freelancer: gig.assignedFreelancer,
      amount,
      platformFee,
      freelancerAmount,
      razorpayOrderId: mockOrderId,
      type: milestoneIndex !== undefined ? 'milestone' : 'full',
      milestone: milestoneIndex !== undefined
        ? { title: gig.milestones[milestoneIndex]?.title, index: milestoneIndex }
        : undefined,
      transactionId: uuidv4(),
      status: 'pending'
    });

    res.json({
      success: true,
      order: { id: mockOrderId, amount: amount * 100, currency: 'INR' },
      paymentId: payment._id,
      key: 'rzp_test_demo',
      isMock: true
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, isMock } = req.body;

    if (!isMock) {
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy')
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');
      if (expected !== razorpay_signature)
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const mockPaymentId = razorpay_payment_id || ('pay_mock_' + Date.now());

    const payment = await Payment.findByIdAndUpdate(paymentId, {
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: razorpay_signature || 'mock_signature',
      status: 'in_escrow',
      paidAt: new Date()
    }, { new: true });

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    await Notification.create({
      user: payment.freelancer,
      type: 'payment_received',
      title: 'Payment in Escrow 🔒',
      message: `₹${payment.freelancerAmount} is held securely in escrow`
    });

    req.app.get('io').to('user_' + payment.freelancer).emit('notification', { type: 'payment_escrow' });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.releasePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (String(payment.client) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (payment.status !== 'in_escrow')
      return res.status(400).json({ success: false, message: 'Payment is not in escrow' });

    payment.status = 'released';
    payment.releasedAt = new Date();
    await payment.save();

    await Freelancer.findOneAndUpdate(
      { user: payment.freelancer },
      { $inc: { totalEarnings: payment.freelancerAmount, completedProjects: 1 } }
    );

    await Notification.create({
      user: payment.freelancer,
      type: 'payment_received',
      title: 'Payment Released! 🎉',
      message: `₹${payment.freelancerAmount} has been transferred to your account`
    });

    req.app.get('io').to('user_' + payment.freelancer).emit('notification', {
      type: 'payment_released',
      amount: payment.freelancerAmount
    });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const query = req.user.role === 'client'
      ? { client: req.user._id }
      : { freelancer: req.user._id };

    const payments = await Payment.find(query)
      .populate('gig', 'title')
      .populate('client', 'name avatar')
      .populate('freelancer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestRefund = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (String(payment.client) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (payment.status !== 'in_escrow')
      return res.status(400).json({ success: false, message: 'Can only refund escrow payments' });

    payment.status = 'refunded';
    payment.refundReason = req.body.reason;
    payment.refundedAt = new Date();
    await payment.save();

    res.json({ success: true, payment, message: 'Refund processed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};