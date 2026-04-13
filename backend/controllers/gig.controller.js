// backend/controllers/gig.controller.js

const mongoose = require('mongoose');

// ── Inline Gig Schema ──────────────────────────────────────────
const gigSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  category:        { type: String, required: true },
  description:     { type: String, required: true },
  requirements:    { type: String, default: '' },
  skills:          [{ type: String }],
  budget:          { type: Number, required: true, min: 0 },
  budgetType:      { type: String, enum: ['fixed','hourly'], default: 'fixed' },
  workType:        { type: String, enum: ['remote','onsite','hybrid'], default: 'remote' },
  experienceLevel: { type: String, enum: ['entry','intermediate','expert'], default: 'entry' },
  duration:        { type: String, default: '' },
  progress:        { type: Number, default: 0, min: 0, max: 100 },
  status:          { type: String, enum: ['open','active','closed','cancelled'], default: 'open' },
  visibility:      { type: String, enum: ['public','private'], default: 'public' },
  client:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bidsCount:       { type: Number, default: 0 },
  views:           { type: Number, default: 0 },
  attachments:     [{ type: String }],
}, { timestamps: true });

// ── Inline Bid Schema ──────────────────────────────────────────
const bidSchema = new mongoose.Schema({
  gig:          { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  freelancer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:       { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  coverLetter:  { type: String, required: true },
  status:       { type: String, enum: ['pending','accepted','rejected','withdrawn'], default: 'pending' },
}, { timestamps: true });

// ── Inline Notification Schema ─────────────────────────────────
const notifSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, default: 'system' },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: '/' },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

const Gig          = mongoose.models.Gig          || mongoose.model('Gig',          gigSchema);
const Bid          = mongoose.models.Bid          || mongoose.model('Bid',          bidSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notifSchema);

let User;
try { User = require('../models/index').User; }
catch {
  const userSchema = new mongoose.Schema({ name: String, email: String, role: String, avatar: String }, { timestamps: true });
  User = mongoose.models.User || mongoose.model('User', userSchema);
}

// ── Helper ─────────────────────────────────────────────────────
const sendNotification = async ({ userId, type, title, message, link, io }) => {
  try {
    const notif = await Notification.create({ user: userId, type, title, message, link });
    if (io) io.to(`user_${userId}`).emit('notification', notif);
  } catch (err) { console.error('Notification error:', err.message); }
};

// ── GET /api/gigs/categories ───────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const staticCategories = [
      'Web Development', 'Mobile Development', 'UI/UX Design',
      'Graphic Design', 'Content Writing', 'Digital Marketing',
      'Data Science', 'Video Editing', 'SEO', 'Other',
    ];
    const dbCategories = await Gig.distinct('category', { status: { $in: ['open','active'] }, visibility: 'public' });
    const merged = [...new Set([...staticCategories, ...dbCategories])].sort();
    res.json({ categories: merged });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── POST /api/gigs ─────────────────────────────────────────────
const createGig = async (req, res) => {
  try {
    const { title, category, description, requirements, skills, budget, budgetType, workType, experienceLevel, duration } = req.body;
    if (!title || !category || !description || !budget) {
      return res.status(400).json({ message: 'Title, category, description and budget are required' });
    }
    const gig = await Gig.create({
      title, category, description, requirements, skills,
      budget, budgetType, workType, experienceLevel, duration,
      client: req.user._id,
    });
    res.status(201).json({ gig });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET /api/gigs ──────────────────────────────────────────────
const getGigs = async (req, res) => {
  try {
    const { category, workType, experienceLevel, minBudget, maxBudget, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = { status: { $in: ['open','active'] }, visibility: 'public' };
    if (category)        filter.category        = category;
    if (workType)        filter.workType        = workType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ title: re }, { description: re }, { skills: { $in: [re] } }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [gigs, total] = await Promise.all([
      Gig.find(filter).populate('client', 'name avatar rating location isVerified').sort(sort).skip(skip).limit(Number(limit)).lean(),
      Gig.countDocuments(filter),
    ]);
    res.json({ gigs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET /api/gigs/my-gigs ──────────────────────────────────────
const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ client: req.user._id }).sort('-createdAt').lean();
    const gigsWithBids = await Promise.all(gigs.map(async g => ({
      ...g,
      bidsCount: await Bid.countDocuments({ gig: g._id }),
    })));
    res.json({ gigs: gigsWithBids });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET /api/gigs/my-bids ──────────────────────────────────────
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate('gig', 'title budget status client category')
      .sort('-createdAt').lean();
    res.json({ bids });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET /api/gigs/:id ──────────────────────────────────────────
const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('client', 'name avatar rating location isVerified bio title').lean();
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    Gig.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {});
    const bidsCount = await Bid.countDocuments({ gig: req.params.id });
    res.json({ gig: { ...gig, bidsCount } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PUT /api/gigs/:id ──────────────────────────────────────────
const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const updated = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ gig: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PUT /api/gigs/:id/progress ─────────────────────────────────
const updateProgress = async (req, res) => {
  try {
    const { progress, milestone } = req.body;
    if (progress === undefined) return res.status(400).json({ message: 'Progress value required' });
    if (progress < 0 || progress > 100) return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (!gig.assignedTo || gig.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized — only assigned freelancer can update progress' });
    }
    const updated = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: { progress: Number(progress) } },
      { new: true }
    );
    const io = req.app.get('io');
    await sendNotification({
      userId: gig.client,
      type: 'progress_update',
      title: 'Gig Progress Updated',
      message: `Progress on "${gig.title}" is now ${progress}%${milestone ? ` — ${milestone}` : ''}`,
      link: '/my-gigs',
      io,
    });
    res.json({ gig: updated, message: `Progress updated to ${progress}%` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── DELETE /api/gigs/:id ───────────────────────────────────────
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Gig.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ gig: req.params.id });
    res.json({ message: 'Gig deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── POST /api/gigs/:id/bids ────────────────────────────────────
const placeBid = async (req, res) => {
  try {
    const { amount, deliveryDays, coverLetter } = req.body;
    if (!amount || !deliveryDays || !coverLetter) return res.status(400).json({ message: 'All bid fields required' });
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.status !== 'open') return res.status(400).json({ message: 'Gig is not accepting bids' });
    if (gig.client.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Cannot bid on your own gig' });
    const existing = await Bid.findOne({ gig: req.params.id, freelancer: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already placed a bid on this gig' });
    const bid = await Bid.create({ gig: req.params.id, freelancer: req.user._id, amount, deliveryDays, coverLetter });
    await Gig.findByIdAndUpdate(req.params.id, { $inc: { bidsCount: 1 } });
    const io = req.app.get('io');
    await sendNotification({
      userId: gig.client,
      type: 'new_bid',
      title: 'New Bid Received',
      message: `${req.user.name} bid ₹${amount} on "${gig.title}"`,
      link: '/my-gigs',
      io,
    });
    res.status(201).json({ bid });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET /api/gigs/:id/bids ─────────────────────────────────────
const getBids = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const bids = await Bid.find({ gig: req.params.id })
      .populate('freelancer', 'name avatar rating completedProjects title location')
      .sort('-createdAt').lean();
    res.json({ bids });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PATCH /api/gigs/:id/bids/:bidId/accept ────────────────────
const acceptBid = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    bid.status = 'accepted';
    await bid.save();
    await Bid.updateMany({ gig: req.params.id, _id: { $ne: bid._id } }, { status: 'rejected' });
    await Gig.findByIdAndUpdate(req.params.id, { status: 'active', assignedTo: bid.freelancer });
    const io = req.app.get('io');
    await sendNotification({
      userId: bid.freelancer,
      type: 'bid_accepted',
      title: 'Your Bid Was Accepted! 🎉',
      message: `Your bid on "${gig.title}" was accepted!`,
      link: '/my-proposals',
      io,
    });
    res.json({ bid });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PATCH /api/gigs/:id/bids/:bidId/reject ────────────────────
const rejectBid = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (bid.status !== 'pending') return res.status(400).json({ message: `Bid is already ${bid.status}` });
    bid.status = 'rejected';
    await bid.save();
    const io = req.app.get('io');
    await sendNotification({
      userId: bid.freelancer,
      type: 'bid_rejected',
      title: 'Bid Not Selected',
      message: `Your bid on "${gig.title}" was not selected this time.`,
      link: '/my-proposals',
      io,
    });
    res.json({ bid, message: 'Bid rejected' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Exports ────────────────────────────────────────────────────
module.exports = {
  getCategories,
  createGig,
  getGigs,
  getMyGigs,
  getMyBids,
  getGigById,
  updateGig,
  updateProgress,
  deleteGig,
  placeBid,
  getBids,
  acceptBid,
  rejectBid,
};