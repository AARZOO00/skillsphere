// backend/routes/subscription.routes.js
// Pro subscription plans with Razorpay recurring payments

const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth.middleware');

// ── Subscription Schema ──────────────────────────────────────
const subSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:          { type: String, enum: ['free','pro','elite'], default: 'free' },
  status:        { type: String, enum: ['active','cancelled','expired','trial'], default: 'trial' },
  startDate:     { type: Date, default: Date.now },
  endDate:       { type: Date },
  razorpaySubId: { type: String },
  razorpayPlanId:{ type: String },
  autoRenew:     { type: Boolean, default: true },
  cancelledAt:   { type: Date },
}, { timestamps: true });

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subSchema);

// ── Plans Config ──────────────────────────────────────────────
const PLANS = {
  free: {
    id:       'free',
    name:     'Free',
    price:    0,
    currency: 'INR',
    interval: null,
    features: [
      'Browse all jobs',
      'Submit up to 5 bids/month',
      'Basic profile listing',
      'Standard search ranking',
      'Community chat access',
    ],
    limits: { bidsPerMonth: 5, featured: false, priorityMatch: false, aiMatch: false },
    color:  '#64748B',
    badge:  '',
  },
  pro: {
    id:       'pro',
    name:     'Pro',
    price:    999,
    currency: 'INR',
    interval: 'monthly',
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || 'plan_pro_monthly',
    features: [
      'Unlimited bid submissions',
      '🌟 Featured profile listing',
      'Priority in search results',
      'AI-powered job matching',
      'Advanced analytics dashboard',
      'Verified Pro badge',
      'Direct client messaging',
      '10% commission reduction',
    ],
    limits: { bidsPerMonth: -1, featured: true, priorityMatch: true, aiMatch: true },
    color:  '#6366F1',
    badge:  '⚡ Pro',
    savings: 'Save ₹1,989 annually',
  },
  elite: {
    id:       'elite',
    name:     'Elite',
    price:    2499,
    currency: 'INR',
    interval: 'monthly',
    razorpayPlanId: process.env.RAZORPAY_ELITE_PLAN_ID || 'plan_elite_monthly',
    features: [
      'Everything in Pro',
      '👑 Elite verified badge',
      'Top placement in all searches',
      'Dedicated account manager',
      'Video profile showcase',
      'Custom profile URL',
      'Early access to premium jobs',
      'Zero commission on first project',
      'Priority dispute resolution',
      '1-on-1 profile review',
    ],
    limits: { bidsPerMonth: -1, featured: true, priorityMatch: true, aiMatch: true, topPlacement: true },
    color:  '#f59e0b',
    badge:  '👑 Elite',
    savings: 'Save ₹4,989 annually',
  },
};

// ══════════════════════════════════════════════════════════════
// GET /api/subscription/plans
// ══════════════════════════════════════════════════════════════
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(PLANS) });
});

// ══════════════════════════════════════════════════════════════
// GET /api/subscription/my-plan
// ══════════════════════════════════════════════════════════════
router.get('/my-plan', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const plan = PLANS[sub?.plan || 'free'];
    const isActive = sub?.status === 'active' || sub?.status === 'trial';
    const daysLeft = sub?.endDate ? Math.ceil((new Date(sub.endDate) - Date.now()) / 86400000) : null;
    res.json({ subscription: sub, plan, isActive, daysLeft });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// POST /api/subscription/create-order
// Creates Razorpay order for subscription
// ══════════════════════════════════════════════════════════════
router.post('/create-order', protect, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan || plan.price === 0) return res.status(400).json({ message: 'Invalid plan' });

    // Razorpay order creation
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await razorpay.orders.create({ amount: plan.price * 100, currency: 'INR', receipt: `sub_${req.user._id}_${Date.now()}` });

    // Placeholder (replace with real Razorpay call above):
    const order = {
      id:       `order_${Date.now()}`,
      amount:   plan.price * 100,
      currency: 'INR',
      receipt:  `sub_${req.user._id}`,
    };

    res.json({
      order,
      plan,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// POST /api/subscription/activate
// Called after successful Razorpay payment
// ══════════════════════════════════════════════════════════════
router.post('/activate', protect, async (req, res) => {
  try {
    const { planId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ message: 'Invalid plan' });

    // Verify Razorpay signature (uncomment in production):
    // const crypto = require('crypto');
    // const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
    // if (expected !== razorpaySignature) return res.status(400).json({ message: 'Invalid payment signature' });

    // Calculate end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Cancel any existing subscription
    await Subscription.updateMany({ user: req.user._id, status: 'active' }, { status: 'cancelled', cancelledAt: new Date() });

    // Create new subscription
    const sub = await Subscription.create({
      user:          req.user._id,
      plan:          planId,
      status:        'active',
      startDate:     new Date(),
      endDate,
      razorpaySubId: razorpayPaymentId,
      autoRenew:     true,
    });

    // Update user model with plan info
    const User = require('../models/index').User;
    await User.findByIdAndUpdate(req.user._id, {
      subscriptionPlan:   planId,
      subscriptionStatus: 'active',
      isFeatured:         plan.limits.featured,
      isPro:              planId !== 'free',
    });

    // Award referral badge if applicable
    const { awardBadge } = require('./referral.routes');
    const io = req.app.get('io');
    if (planId === 'pro')   await awardBadge(req.user._id, 'pro_member', io);
    if (planId === 'elite') await awardBadge(req.user._id, 'elite_member', io);

    res.json({ success: true, subscription: sub, plan });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// POST /api/subscription/cancel
// ══════════════════════════════════════════════════════════════
router.post('/cancel', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { user: req.user._id, status: 'active' },
      { status: 'cancelled', autoRenew: false, cancelledAt: new Date() },
      { new: true }
    );
    if (!sub) return res.status(404).json({ message: 'No active subscription found' });

    const User = require('../models/index').User;
    await User.findByIdAndUpdate(req.user._id, {
      subscriptionPlan:   'free',
      subscriptionStatus: 'cancelled',
      isFeatured:         false,
      isPro:              false,
    });

    res.json({ success: true, message: `Subscription cancelled. Access continues until ${sub.endDate?.toLocaleDateString()}` });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// Middleware: check if user has pro features
// Usage: router.get('/pro-feature', checkPro, handler)
// ══════════════════════════════════════════════════════════════
const checkPro = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!sub || sub.plan === 'free') {
      return res.status(403).json({ message: 'Pro subscription required', upgrade: true });
    }
    req.subscription = sub;
    req.plan = PLANS[sub.plan];
    next();
  } catch(err) { res.status(500).json({ message: err.message }); }
};

module.exports = { router, PLANS, checkPro };