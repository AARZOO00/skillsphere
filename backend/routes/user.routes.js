// backend/routes/user.routes.js
// CRITICAL: Route order matters — specific routes BEFORE /:id

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User    = require('../models/user.model');

// ── GET /api/users/profile  (own profile) ───────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -__v -twoFASecret');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/profile ──────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name','title','bio','location','hourlyRate','skills','languages','education','portfolio','website','linkedin','github','responseTime'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new:true, runValidators:true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/notification-preferences ─────────────────────
router.put('/notification-preferences', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { notifPrefs: req.body }, { new:true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/users/dashboard-stats ─────────────────────────────
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    let Gig, Bid;
    try { Gig = require('../models/Gig.model'); } catch { Gig = null; }
    try { Bid = require('../models/bid.model'); } catch { Bid = null; }

    const userId = req.user._id;
    const role   = req.user.role;

    if (role === 'client' && Gig && Bid) {
      const myGigIds = await Gig.distinct('_id', { client: userId });
      const [activeGigs, proposalsReceived, hiredArr] = await Promise.all([
        Gig.countDocuments({ client: userId, status: { $in:['open','active'] } }),
        Bid.countDocuments({ gig: { $in:myGigIds }, status: 'pending' }),
        Gig.distinct('assignedFreelancer', { client: userId, assignedFreelancer:{ $exists:true, $ne:null } }),
      ]);
      return res.json({ activeGigs, proposalsReceived, totalSpent:0, thisMonth:0, hiredFreelancers: hiredArr.length });
    }

    if (role === 'freelancer' && Bid) {
      const myBids = await Bid.find({ freelancer: userId });
      const activeProposals   = myBids.filter(b=>b.status==='pending').length;
      const completedProjects = myBids.filter(b=>b.status==='accepted').length;
      const totalEarned       = myBids.filter(b=>b.status==='accepted').reduce((a,b)=>a+(b.amount||0),0);
      return res.json({ activeProposals, completedProjects, totalEarned, thisMonth:Math.round(totalEarned*0.15), avgRating:req.user.rating||0, reviewCount:req.user.reviewCount||0, successRate: myBids.length?`${Math.round(completedProjects/myBids.length*100)}%`:'0%' });
    }

    res.json({ activeGigs:0, proposalsReceived:0, totalSpent:0, thisMonth:0, hiredFreelancers:0 });
  } catch (err) {
    console.error('dashboard-stats:', err.message);
    res.json({ activeGigs:0, proposalsReceived:0, totalSpent:0, thisMonth:0 });
  }
});

// ── GET /api/users/freelancers  (list) ──────────────────────────
router.get('/freelancers', async (req, res) => {
  try {
    const { search, skill, sort='rating', page=1, limit=12 } = req.query;
    const query = { role:'freelancer' };
    if (search) query.$or = [{ name:{ $regex:search,$options:'i' } }, { title:{ $regex:search,$options:'i' } }];
    if (skill && skill!=='All') query.skills = { $in:[new RegExp(skill,'i')] };
    const sortMap = { rating:{ rating:-1 }, projects:{ completedProjects:-1 }, price_asc:{ hourlyRate:1 }, price_desc:{ hourlyRate:-1 } };
    const freelancers = await User.find(query)
      .select('name title avatar location rating reviewCount completedProjects hourlyRate skills isOnline isVerified')
      .sort(sortMap[sort]||{ rating:-1 })
      .skip((Number(page)-1)*Number(limit))
      .limit(Number(limit));
    res.json({ freelancers, total: await User.countDocuments(query) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/users/freelancers/:id ──────────────────────────────
router.get('/freelancers/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v -twoFASecret');
    if (!user) return res.status(404).json({ message:'User not found' });
    res.json({ freelancer: user });
  } catch (err) {
    if (err.name==='CastError') return res.status(404).json({ message:'User not found' });
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/users/:id  — MUST BE LAST ──────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v -twoFASecret');
    if (!user) return res.status(404).json({ message:'User not found' });
    res.json({ user });
  } catch (err) {
    if (err.name==='CastError') return res.status(404).json({ message:'User not found' });
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;