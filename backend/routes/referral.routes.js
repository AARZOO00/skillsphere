// backend/routes/referral.routes.js
// Referral system: earn credits for referring, badges for milestones

const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth.middleware');

// ── Schemas ──────────────────────────────────────────────────
const referralSchema = new mongoose.Schema({
  referrer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  code:      { type: String, required: true },
  status:    { type: String, enum: ['pending','completed','rewarded'], default: 'pending' },
  creditsAwarded: { type: Number, default: 0 },
}, { timestamps: true });

const badgeSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge:     { type: String, required: true },
  awardedAt: { type: Date, default: Date.now },
  milestone: { type: String },
});

const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);
const Badge    = mongoose.models.Badge    || mongoose.model('Badge',    badgeSchema);

// ── BADGES CONFIG ─────────────────────────────────────────────
const BADGES = {
  FIRST_REFERRAL:    { id:'first_referral',    name:'First Referral',      emoji:'🌟', desc:'Referred your first user',        credits: 100 },
  SUPER_REFERRER:    { id:'super_referrer',    name:'Super Referrer',      emoji:'🚀', desc:'Referred 5 users',                credits: 500 },
  REFERRAL_KING:     { id:'referral_king',     name:'Referral King',       emoji:'👑', desc:'Referred 25 users',               credits: 2500 },
  PROFILE_COMPLETE:  { id:'profile_complete',  name:'Profile Star',        emoji:'⭐', desc:'Completed your profile 100%',     credits: 50  },
  FIRST_BID:         { id:'first_bid',         name:'First Proposal',      emoji:'📋', desc:'Submitted your first bid',        credits: 25  },
  FIRST_PROJECT:     { id:'first_project',     name:'First Win',           emoji:'🏆', desc:'Completed your first project',   credits: 200 },
  TEN_PROJECTS:      { id:'ten_projects',      name:'Decade',              emoji:'💎', desc:'Completed 10 projects',           credits: 500 },
  TOP_RATED:         { id:'top_rated',         name:'Top Rated',           emoji:'🥇', desc:'Maintained 4.8+ rating',         credits: 300 },
  EARLY_ADOPTER:     { id:'early_adopter',     name:'Early Adopter',       emoji:'🛸', desc:'Joined in the first 1000 users', credits: 150 },
};

const REFERRAL_CREDITS = 200; // credits per successful referral

// ── Helper: generate referral code ───────────────────────────
const genCode = (userId) => {
  const base = userId.toString().slice(-6).toUpperCase();
  const rand = Math.random().toString(36).slice(-3).toUpperCase();
  return `SS-${base}${rand}`;
};

// ── Helper: award badge ────────────────────────────────────────
const awardBadge = async (userId, badgeId, io) => {
  const existing = await Badge.findOne({ user: userId, badge: badgeId });
  if (existing) return null;

  const cfg = BADGES[badgeId.toUpperCase()] || Object.values(BADGES).find(b => b.id === badgeId);
  if (!cfg) return null;

  await Badge.create({ user: userId, badge: cfg.id, milestone: cfg.name });

  // Add credits
  const User = require('../models/User.model');
  await User.findByIdAndUpdate(userId, { $inc: { credits: cfg.credits } });

  // Real-time notification
  if (io) {
    io.to(`user_${userId}`).emit('badge_awarded', { badge: cfg, credits: cfg.credits });
  }

  return cfg;
};

// ── Helper: check milestones ───────────────────────────────────
const checkReferralMilestones = async (userId, totalReferrals, io) => {
  if (totalReferrals >= 1)  await awardBadge(userId, 'first_referral', io);
  if (totalReferrals >= 5)  await awardBadge(userId, 'super_referrer', io);
  if (totalReferrals >= 25) await awardBadge(userId, 'referral_king', io);
};

// ══════════════════════════════════════════════════════════════
// GET /api/referral/my-code — get or create user's referral code
// ══════════════════════════════════════════════════════════════
router.get('/my-code', protect, async (req, res) => {
  try {
    const User = require('../models/User.model');
    let user   = await User.findById(req.user._id).select('referralCode credits');
    if (!user.referralCode) {
      user.referralCode = genCode(req.user._id);
      await user.save();
    }
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referred', 'name email createdAt')
      .sort({ createdAt: -1 });
    const badges    = await Badge.find({ user: req.user._id });
    const totalEarned = referrals.filter(r=>r.status==='rewarded').reduce((a,r)=>a+r.creditsAwarded,0);
    res.json({
      code: user.referralCode,
      link: `${process.env.FRONTEND_URL||'http://localhost:3000'}/register?ref=${user.referralCode}`,
      credits: user.credits || 0,
      totalEarned,
      referrals,
      badges: badges.map(b => ({ ...BADGES[b.badge.toUpperCase()] || {}, awardedAt: b.awardedAt })),
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// POST /api/referral/apply — apply referral code on register
// ══════════════════════════════════════════════════════════════
router.post('/apply', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Referral code required' });

    const User    = require('../models/User.model');
    const referrer = await User.findOne({ referralCode: code.toUpperCase() });
    if (!referrer) return res.status(404).json({ message: 'Invalid referral code' });
    if (referrer._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: "You can't use your own referral code" });

    // Check not already referred
    const existing = await Referral.findOne({ referred: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already used a referral code' });

    // Create referral
    const referral = await Referral.create({
      referrer: referrer._id,
      referred: req.user._id,
      code: code.toUpperCase(),
      status: 'completed',
      creditsAwarded: REFERRAL_CREDITS,
    });

    // Award credits to referrer
    await User.findByIdAndUpdate(referrer._id, {
      $inc: { credits: REFERRAL_CREDITS },
    });

    // Mark rewarded
    referral.status = 'rewarded';
    await referral.save();

    // Give referred user a welcome bonus too
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 50 } });

    // Check milestone badges
    const totalReferrals = await Referral.countDocuments({ referrer: referrer._id, status:'rewarded' });
    const io = req.app.get('io');
    await checkReferralMilestones(referrer._id, totalReferrals, io);

    // Notify referrer
    if (io) {
      io.to(`user_${referrer._id}`).emit('referral_success', {
        name: req.user.name,
        credits: REFERRAL_CREDITS,
      });
    }

    res.json({
      success: true,
      message: `Referral applied! ${referrer.name} earned ${REFERRAL_CREDITS} credits`,
      creditsEarned: 50,
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// POST /api/referral/award-badge — manually award badge (admin/system)
// ══════════════════════════════════════════════════════════════
router.post('/award-badge', protect, async (req, res) => {
  try {
    const { badgeId, userId } = req.body;
    const targetId = userId || req.user._id;
    const io = req.app.get('io');
    const badge = await awardBadge(targetId, badgeId, io);
    if (!badge) return res.json({ message: 'Badge already awarded or not found' });
    res.json({ success: true, badge });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// GET /api/referral/leaderboard — top referrers
// ══════════════════════════════════════════════════════════════
router.get('/leaderboard', async (req, res) => {
  try {
    const top = await Referral.aggregate([
      { $match: { status: 'rewarded' } },
      { $group: { _id: '$referrer', count: { $sum: 1 }, credits: { $sum: '$creditsAwarded' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name:'$user.name', avatar:'$user.avatar', count:1, credits:1 } },
    ]);
    res.json({ leaderboard: top });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// GET /api/referral/badges/all — get all possible badges
// ══════════════════════════════════════════════════════════════
router.get('/badges/all', (req, res) => {
  res.json({ badges: Object.values(BADGES) });
});

module.exports = { router, awardBadge, BADGES };