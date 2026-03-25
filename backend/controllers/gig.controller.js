const Gig          = require('../models/Gig.model');
const Bid          = require('../models/Bid.model');
const User         = require('../models/User.model');
const Notification = require('../models/Notification.model');

const sendNotification = async ({ userId, type, title, message, link, io }) => {
  try {
    const notif = await Notification.create({ user: userId, type, title, message, link });
    if (io) io.to(`user_${userId}`).emit('notification', notif);
    return notif;
  } catch (err) { console.error('Notification error:', err.message); }
};

exports.createGig = async (req, res) => {
  try {
    const data = { ...req.body, client: req.user._id, isApproved: true, status: 'open' };
    if (typeof data.skills === 'string') data.skills = JSON.parse(data.skills);
    if (typeof data.budget === 'string') data.budget = JSON.parse(data.budget);
    if (typeof data.milestones === 'string') data.milestones = JSON.parse(data.milestones);
    if (typeof data.location === 'string') data.location = JSON.parse(data.location);
    if (req.files && req.files.length > 0)
      data.attachments = req.files.map(f => ({ name: f.originalname, url: f.path, type: f.mimetype }));

    const gig = await Gig.create(data);

    // Matching freelancers ko notify karo
    const skills = data.skills || [];
    const matchingFreelancers = await User.find({
      role: 'freelancer',
      _id: { $ne: req.user._id }
    }).select('_id');

    const io = req.app.get('io');
    await Promise.allSettled(matchingFreelancers.map(f =>
      sendNotification({
        userId: f._id,
        type: 'new_gig',
        title: '⚡ New Job Posted!',
        message: `A new job is available: "${gig.title}"`,
        link: `/gigs/${gig._id}`,
        io
      })
    ));

    const populated = await Gig.findById(gig._id).populate('client', 'name email avatar');
    res.status(201).json({ success: true, gig: populated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getGigs = async (req, res) => {
  try {
    const { skills, category, minBudget, maxBudget, experience, search, locationType, page = 1, limit = 12 } = req.query;
    const query = { status: 'open', isApproved: true };
    if (skills) query.skills = { $in: skills.split(',').map(s => s.trim()) };
    if (category) query.category = category;
    if (experience) query.experienceLevel = experience;
    if (locationType) query['location.type'] = locationType;
    if (minBudget || maxBudget) {
      query['budget.min'] = {};
      if (minBudget) query['budget.min'].$gte = Number(minBudget);
      if (maxBudget) query['budget.max'] = { $lte: Number(maxBudget) };
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { skills: new RegExp(search, 'i') }
      ];
    }
    const total = await Gig.countDocuments(query);
    const gigs = await Gig.find(query)
      .populate('client', 'name avatar location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const gigsWithBids = await Promise.all(gigs.map(async g => {
      const bidsCount = await Bid.countDocuments({ gig: g._id });
      return { ...g.toObject(), bidsCount };
    }));

    res.json({ success: true, gigs: gigsWithBids, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('client', 'name avatar location createdAt')
      .populate({ path: 'proposals', populate: { path: 'freelancer', select: 'name avatar' }, options: { limit: 5 } });
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    gig.views++;
    await gig.save({ validateBeforeSave: false });
    const bidsCount = await Bid.countDocuments({ gig: gig._id });
    res.json({ success: true, gig: { ...gig.toObject(), bidsCount } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ client: req.user._id }).sort({ createdAt: -1 });
    const gigsWithBids = await Promise.all(gigs.map(async g => {
      const bidsCount = await Bid.countDocuments({ gig: g._id });
      return { ...g.toObject(), bidsCount };
    }));
    res.json({ success: true, gigs: gigsWithBids });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const updated = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, gig: updated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await Bid.deleteMany({ gig: req.params.id });
    await gig.deleteOne();
    res.json({ success: true, message: 'Gig deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProgress = async (req, res) => {
  try {
    const { percentage, message } = req.body;
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (String(gig.assignedFreelancer) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    gig.progress = percentage;
    gig.progressLogs.push({ message, percentage });
    if (percentage === 100) gig.status = 'completed';
    await gig.save();
    await Notification.create({ user: gig.client, type: 'milestone_completed', title: 'Progress Updated', message: `Project progress: ${percentage}%`, link: '/gigs/' + gig._id });
    req.app.get('io').to('user_' + gig.client).emit('notification', { type: 'progress_update' });
    res.json({ success: true, gig });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getCategories = async (req, res) => {
  try {
    const cats = await Gig.aggregate([
      { $match: { status: 'open', isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, categories: cats });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ===== BID FUNCTIONS =====

exports.placeBid = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('client', '_id name');
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.status !== 'open') return res.status(400).json({ success: false, message: 'Gig is not open' });
    if (String(gig.client._id) === String(req.user._id))
      return res.status(400).json({ success: false, message: 'Cannot bid on your own gig' });

    const existing = await Bid.findOne({ gig: req.params.id, freelancer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already placed a bid' });

    const { amount, deliveryDays, proposal } = req.body;
    if (!amount || !deliveryDays || !proposal)
      return res.status(400).json({ success: false, message: 'Amount, delivery days and proposal required' });

    const bid = await Bid.create({ gig: req.params.id, freelancer: req.user._id, amount: Number(amount), deliveryDays: Number(deliveryDays), proposal, status: 'pending' });

    const io = req.app.get('io');
    await sendNotification({ userId: gig.client._id, type: 'new_proposal', title: '🤝 New Bid!', message: `New bid of ₹${Number(amount).toLocaleString()} on "${gig.title}"`, link: '/my-gigs', io });

    await bid.populate('freelancer', 'name avatar');
    res.status(201).json({ success: true, bid });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getGigBids = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (String(gig.client) !== String(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const bids = await Bid.find({ gig: req.params.id }).populate('freelancer', 'name avatar location').sort({ createdAt: -1 });
    res.json({ success: true, bids });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.acceptBid = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (String(gig.client) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });

    const bid = await Bid.findById(req.params.bidId).populate('freelancer', '_id name');
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

    bid.status = 'accepted';
    await bid.save();

    await Bid.updateMany({ gig: req.params.id, _id: { $ne: bid._id }, status: 'pending' }, { status: 'rejected' });

    gig.status = 'in_progress';
    gig.assignedFreelancer = bid.freelancer._id;
    await gig.save();

    const io = req.app.get('io');
    await sendNotification({ userId: bid.freelancer._id, type: 'proposal_accepted', title: '🎉 Bid Accepted!', message: `Your bid for "${gig.title}" was accepted!`, link: '/my-proposals', io });

    res.json({ success: true, bid });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.rejectBid = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (String(gig.client) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });

    const bid = await Bid.findById(req.params.bidId).populate('freelancer', '_id name');
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

    bid.status = 'rejected';
    await bid.save();

    const io = req.app.get('io');
    await sendNotification({ userId: bid.freelancer._id, type: 'proposal_rejected', title: 'Bid Not Selected', message: `Your bid for "${gig.title}" was not selected.`, link: '/gigs', io });

    res.json({ success: true, bid });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate('gig', 'title budget status client')
      .sort({ createdAt: -1 });
    res.json({ success: true, bids });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};