// controllers/gig.controller.js
// Fixed: replaced  import { create } from '../models/Notification.model.js'
//        with      const Notification = require('../models/Notification.model');

const Gig          = require('../models/gig.model');
const Bid          = require('../models/bid.model');
const User         = require('../models/User.model');
const Notification = require('../models/Notification.model');  // ← FIXED

// ─── Helper: send in-app notification ───────────────────────────
const sendNotification = async ({ userId, type, title, message, link, io }) => {
  try {
    const notif = await Notification.create({ user: userId, type, title, message, link });
    if (io) io.to(`user_${userId}`).emit('notification', notif);
    return notif;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

// ─── Helper: safe array from any API shape ──────────────────────
const safeArray = (data) => {
  if (Array.isArray(data))       return data;
  if (Array.isArray(data?.gigs)) return data.gigs;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// ── @desc  Create gig ── POST /api/gigs ─────────────────────────
const createGig = async (req, res) => {
  try {
    const {
      title, category, description, requirements,
      skills, budget, budgetType, deadline, bidDeadline,
      experienceLevel, workType, allowBids, visibility, milestones,
    } = req.body;

    const gig = await Gig.create({
      title, category, description, requirements,
      skills: Array.isArray(skills) ? skills : [],
      budget: Number(budget),
      budgetType: budgetType || 'fixed',
      deadline, bidDeadline,
      experienceLevel: experienceLevel || 'intermediate',
      workType: workType || 'remote',
      allowBids: allowBids !== false,
      visibility: visibility || 'public',
      milestones: Array.isArray(milestones) ? milestones : [],
      client: req.user._id,
      status: 'open',
    });

    // Notify matching freelancers
    if (visibility !== 'private') {
      const query = { role: 'freelancer', _id: { $ne: req.user._id } };
      if (skills?.length > 0) query.skills = { $in: skills };

      const freelancers = await User.find(query).select('_id').limit(100);
      const io = req.app.get('io');

      await Promise.allSettled(
        freelancers.map(f =>
          sendNotification({
            userId:  f._id,
            type:    'new_gig',
            title:   '⚡ New Job Posted!',
            message: `A new job matching your skills: "${title}"`,
            link:    `/gigs/${gig._id}`,
            io,
          })
        )
      );
    }

    const populated = await Gig.findById(gig._id).populate('client', 'name email avatar');
    res.status(201).json(populated);

  } catch (err) {
    console.error('createGig:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Get all gigs ── GET /api/gigs ────────────────────────
const getGigs = async (req, res) => {
  try {
    const { search, category, minBudget, maxBudget, experience, workType, page = 1, limit = 20 } = req.query;

    const query = { status: { $in: ['open','active'] }, visibility: 'public' };

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills:      { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category)   query.category = category;
    if (workType)   query.workType = workType;
    if (experience) query.experienceLevel = experience;
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    const total = await Gig.countDocuments(query);
    const gigs  = await Gig.find(query)
      .populate('client', 'name avatar rating location')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Attach bids count
    const gigsWithBids = await Promise.all(
      gigs.map(async g => {
        const bidsCount = await Bid.countDocuments({ gig: g._id });
        return { ...g.toObject(), bidsCount };
      })
    );

    res.json({ gigs: gigsWithBids, total, page: Number(page), pages: Math.ceil(total / limit) });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Get categories ── GET /api/gigs/categories ───────────
const getCategories = async (req, res) => {
  try {
    const categories = await Gig.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Get my gigs ── GET /api/gigs/my-gigs ─────────────────
const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ client: req.user._id }).sort({ createdAt: -1 });
    const gigsWithBids = await Promise.all(
      gigs.map(async g => {
        const bidsCount = await Bid.countDocuments({ gig: g._id });
        return { ...g.toObject(), bidsCount };
      })
    );
    res.json(gigsWithBids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Get my bids ── GET /api/gigs/my-bids ─────────────────
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate('gig', 'title budget budgetType deadline status')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Get single gig ── GET /api/gigs/:id ──────────────────
const getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('client', 'name email avatar rating location');
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    const bidsCount = await Bid.countDocuments({ gig: gig._id });
    res.json({ ...gig.toObject(), bidsCount });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Gig not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Update gig ── PUT /api/gigs/:id ──────────────────────
const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Update progress ── PUT /api/gigs/:id/progress ────────
const updateProgress = async (req, res) => {
  try {
    const { milestoneIndex, status } = req.body;
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    if (Array.isArray(gig.milestones) && gig.milestones[milestoneIndex]) {
      gig.milestones[milestoneIndex].status = status;
      await gig.save();
    }
    res.json(gig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Delete gig ── DELETE /api/gigs/:id ───────────────────
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    await Bid.deleteMany({ gig: req.params.id });
    await gig.deleteOne();
    res.json({ message: 'Gig deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Place bid ── POST /api/gigs/:id/bids ─────────────────
const placeBid = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('client', '_id name');
    if (!gig)           return res.status(404).json({ message: 'Gig not found' });
    if (!gig.allowBids) return res.status(400).json({ message: 'Bidding is not allowed on this gig' });
    if (gig.status !== 'open') return res.status(400).json({ message: 'Gig is no longer accepting bids' });

    const existing = await Bid.findOne({ gig: req.params.id, freelancer: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already placed a bid' });

    const { amount, deliveryDays, proposal } = req.body;
    if (!amount || !deliveryDays || !proposal)
      return res.status(400).json({ message: 'Amount, delivery days, and proposal are required' });

    const bid = await Bid.create({
      gig:          req.params.id,
      freelancer:   req.user._id,
      amount:       Number(amount),
      deliveryDays: Number(deliveryDays),
      proposal,
      status:       'pending',
    });

    // Notify client
    const io = req.app.get('io');
    await sendNotification({
      userId:  gig.client._id,
      type:    'new_bid',
      title:   '🤝 New Bid Received!',
      message: `${req.user.name} placed a bid of ₹${Number(amount).toLocaleString()} on "${gig.title}"`,
      link:    `/my-gigs`,
      io,
    });

    const populated = await Bid.findById(bid._id)
      .populate('freelancer', 'name avatar rating location skills');
    res.status(201).json(populated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Get gig bids ── GET /api/gigs/:id/bids ───────────────
const getGigBids = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const bids = await Bid.find({ gig: req.params.id })
      .populate('freelancer', 'name avatar rating location skills')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Accept bid ── PATCH /api/gigs/:id/bids/:bidId/accept ─
const acceptBid = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const bid = await Bid.findById(req.params.bidId).populate('freelancer', '_id name');
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    bid.status = 'accepted';
    await bid.save();

    // Reject all other pending bids
    await Bid.updateMany(
      { gig: req.params.id, _id: { $ne: bid._id }, status: 'pending' },
      { status: 'rejected' }
    );

    // Update gig status
    gig.status = 'active';
    gig.acceptedBid = bid._id;
    gig.assignedFreelancer = bid.freelancer._id;
    await gig.save();

    const io = req.app.get('io');

    // Notify accepted freelancer
    await sendNotification({
      userId:  bid.freelancer._id,
      type:    'bid_accepted',
      title:   '🎉 Your Bid was Accepted!',
      message: `Your bid of ₹${bid.amount.toLocaleString()} for "${gig.title}" was accepted.`,
      link:    `/chat?gigId=${gig._id}`,
      io,
    });

    // Notify rejected freelancers
    const rejectedBids = await Bid.find({ gig: req.params.id, status: 'rejected' }).select('freelancer');
    await Promise.allSettled(
      rejectedBids.map(rb =>
        sendNotification({
          userId:  rb.freelancer,
          type:    'bid_rejected',
          title:   'Bid Not Selected',
          message: `Another freelancer was selected for "${gig.title}".`,
          link:    `/gigs`,
          io,
        })
      )
    );

    res.json({ message: 'Bid accepted', bid });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── @desc  Reject bid ── PATCH /api/gigs/:id/bids/:bidId/reject ─
const rejectBid = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const bid = await Bid.findById(req.params.bidId).populate('freelancer', '_id name');
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    bid.status = 'rejected';
    await bid.save();

    const io = req.app.get('io');
    await sendNotification({
      userId:  bid.freelancer._id,
      type:    'bid_rejected',
      title:   'Bid Not Selected',
      message: `Your bid for "${gig.title}" was not selected. Keep applying!`,
      link:    `/gigs`,
      io,
    });

    res.json({ message: 'Bid rejected', bid });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createGig, getGigs, getCategories, getMyGigs, getMyBids,
  getGig, updateGig, updateProgress, deleteGig,
  placeBid, getGigBids, acceptBid, rejectBid,
};