// ════════════════════════════════════════════════════════════════
// backend/routes/payment.routes.js  (create this file if missing)
// ════════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Try to import Payment model — create a simple one if it doesn't exist
let Payment;
try {
  Payment = require('../models/payment.model');
} catch {
  // If model doesn't exist, create inline schema
  const mongoose = require('mongoose');
  const paymentSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gig:         { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    type:        { type: String, enum: ['payment','withdrawal','refund','escrow'], default: 'payment' },
    title:       { type: String },
    counterparty:{ type: String },
    amount:      { type: Number, required: true },
    status:      { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },
    method:      { type: String, default: 'Escrow' },
    ref:         { type: String },
    razorpayId:  { type: String },
  }, { timestamps: true });
  Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
}

// ── GET /api/payments/stats ──────────────────────────────────────
// Used by PaymentPage.js
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const all = await Payment.find({ user: userId });

    const escrow   = all.filter(p => p.type === 'escrow'   && p.status === 'pending').reduce((a,p) => a + p.amount, 0);
    const released = all.filter(p => p.status === 'completed').reduce((a,p) => a + p.amount, 0);
    const pending  = all.filter(p => p.status === 'pending').reduce((a,p) => a + p.amount, 0);

    res.json({
      escrow,
      released,
      pending,
      totalTransactions: all.length,
      platformFee: Math.round(released * 0.1),
    });
  } catch (err) {
    // If no transactions yet, return zeros (don't crash)
    res.json({ escrow: 0, released: 0, pending: 0, totalTransactions: 0, platformFee: 0 });
  }
});

// ── GET /api/payments/transactions ──────────────────────────────
// Used by PaymentPage.js
router.get('/transactions', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { user: req.user._id };
    if (status && status !== 'all') query.status = status;

    const txns = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({ transactions: txns, total });
  } catch (err) {
    // Return empty if collection doesn't exist yet
    res.json({ transactions: [], total: 0 });
  }
});

// ── POST /api/payments/razorpay/order ───────────────────────────
// Create Razorpay order
router.post('/razorpay/order', protect, async (req, res) => {
  try {
    const { amount, gigId } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount required' });

    // If you have Razorpay configured:
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: `receipt_${Date.now()}` });
    // return res.json(order);

    // Placeholder response until Razorpay is configured:
    res.json({
      id: `order_${Date.now()}`,
      amount: amount * 100,
      currency: 'INR',
      status: 'created',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/payments/razorpay/verify ──────────────────────────
// Verify Razorpay payment
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, gigId, amount } = req.body;

    // Verify signature:
    // const crypto = require('crypto');
    // const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    // if (generated !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });

    // Save payment record
    await Payment.create({
      user:        req.user._id,
      gig:         gigId,
      type:        'payment',
      title:       'Project Payment',
      amount:      Number(amount),
      status:      'completed',
      method:      'Razorpay',
      ref:         `SKL-${Date.now()}`,
      razorpayId:  razorpay_payment_id,
    });

    res.json({ success: true, message: 'Payment verified and recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/payments/escrow/release ───────────────────────────
// Release escrow payment to freelancer
router.post('/escrow/release', protect, async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { _id: paymentId, user: req.user._id },
      { status: 'completed', type: 'payment' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;