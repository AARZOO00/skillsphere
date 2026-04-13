// ════════════════════════════════════════════════════════════════
// backend/routes/admin.routes.js
// ════════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/index').User;
const Gig  = require('../models/index').Gig;

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// ── GET /api/admin/stats ─────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalGigs, activeProjects, disputes] = await Promise.all([
      User.countDocuments(),
      Gig.countDocuments(),
      Gig.countDocuments({ status: { $in: ['open','active'] } }),
      Gig.countDocuments({ hasDispute: true }).catch(() => 0),
    ]);

    const pendingApproval = await Gig.countDocuments({ status: 'pending' }).catch(() => 0);
    const newUsersToday   = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    }).catch(() => 0);

    res.json({
      totalUsers,
      totalGigs,
      totalRevenue:   totalGigs * 35000,  // approximate until payment model integrated
      activeProjects,
      pendingApproval,
      disputes,
      newUsersToday,
      platformFee: Math.round(totalGigs * 35000 * 0.1),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/users ─────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status, sort = 'newest' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role   && role   !== 'all') query.role   = role;
    if (status && status !== 'all') query.status = status;

    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, name: { name: 1 } };

    const users = await User.find(query)
      .select('-password')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/users/:id/suspend ───────────────────────────
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User suspended', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/users/:id/activate ──────────────────────────
router.patch('/users/:id/activate', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User activated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/users/:id/verify ────────────────────────────
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User verified', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/gigs ──────────────────────────────────────────
router.get('/gigs', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query;
    const query = {};

    if (search)   query.$or = [{ title: { $regex: search, $options: 'i' } }];
    if (status && status !== 'all') query.status = status;
    if (category) query.category = category;

    const gigs = await Gig.find(query)
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Gig.countDocuments(query);
    res.json({ gigs, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/gigs/:id/approve ────────────────────────────
router.patch('/gigs/:id/approve', async (req, res) => {
  try {
    const gig = await Gig.findByIdAndUpdate(req.params.id, { status: 'open' }, { new: true });
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    res.json({ message: 'Gig approved', gig });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/gigs/:id/reject ─────────────────────────────
router.patch('/gigs/:id/reject', async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const gig = await Gig.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectionReason: reason }, { new: true });
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    res.json({ message: 'Gig rejected', gig });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/admin/gigs/:id ────────────────────────────────────
router.delete('/gigs/:id', async (req, res) => {
  try {
    const gig = await Gig.findByIdAndDelete(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    res.json({ message: 'Gig deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;