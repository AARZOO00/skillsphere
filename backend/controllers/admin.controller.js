const mongoose = require('mongoose');
const User = require('../models/User.model');
const Gig = require('../models/Gig.model');
const Payment = require('../models/Payment.model');
const Review = require('../models/Review.model');
const Freelancer = require('../models/Freelancer.model');
const Dispute = require('../models/Dispute.model');
const Notification = require('../models/Notification.model');

exports.getAnalytics = async (req, res) => {
  try {
    const [totalUsers, freelancers, clients, totalGigs, activeGigs, completedGigs, revenue, openDisputes, flaggedReviews, newUsersThisMonth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' }),
      Gig.countDocuments(),
      Gig.countDocuments({ status: 'open' }),
      Gig.countDocuments({ status: 'completed' }),
      Payment.aggregate([{ $match: { status: 'released' } }, { $group: { _id: null, total: { $sum: '$platformFee' }, count: { $sum: 1 } } }]),
      Dispute.countDocuments({ status: 'open' }),
      Review.countDocuments({ isFlagged: true }),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })
    ]);

    const [monthlyRevenue, topCategories] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'released', createdAt: { $gte: new Date(Date.now() - 180 * 86400000) } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$platformFee' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Gig.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 }
      ])
    ]);

    res.json({ success: true, analytics: {
      users: { total: totalUsers, freelancers, clients, newThisMonth: newUsersThisMonth },
      gigs: { total: totalGigs, active: activeGigs, completed: completedGigs, successRate: totalGigs ? Math.round(completedGigs / totalGigs * 100) : 0 },
      revenue: { total: revenue[0]?.total || 0, transactions: revenue[0]?.count || 0 },
      issues: { openDisputes, flaggedReviews },
      monthlyRevenue, topCategories
    }});
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, search, isSuspended, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isSuspended !== undefined) query.isSuspended = isSuspended === 'true';
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot suspend admin' });
    user.isSuspended = !user.isSuspended;
    user.suspendReason = user.isSuspended ? req.body.reason : undefined;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user, message: user.isSuspended ? 'User suspended' : 'User reactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOneAndUpdate(
      { user: req.params.userId },
      { isVerified: true, verificationBadge: req.body.badge || 'basic' },
      { new: true }
    ).populate('user', 'name email');
    if (!freelancer) return res.status(404).json({ success: false, message: 'Freelancer not found' });
    await Notification.create({ user: req.params.userId, type: 'account_verified', title: 'Account Verified!', message: 'You received the ' + (req.body.badge || 'basic') + ' verification badge' });
    res.json({ success: true, freelancer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.approveGig = async (req, res) => {
  try {
    const { approved, reason } = req.body;
    const gig = await Gig.findByIdAndUpdate(req.params.id, { isApproved: approved }, { new: true }).populate('client', 'name');
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    await Notification.create({ user: gig.client._id, type: 'new_gig', title: approved ? 'Gig Approved' : 'Gig Rejected', message: approved ? 'Your gig "' + gig.title + '" is now live' : 'Gig rejected: ' + reason, link: '/gigs/' + gig._id });
    res.json({ success: true, gig });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('raisedBy', 'name avatar').populate('against', 'name avatar').populate('gig', 'title').sort({ createdAt: -1 });
    res.json({ success: true, disputes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.resolveDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, {
      status: 'resolved',
      resolution: { outcome: req.body.outcome, adminNote: req.body.adminNote, resolvedBy: req.user._id, resolvedAt: new Date() }
    }, { new: true });
    if (!dispute) return res.status(404).json({ success: false, message: 'Not found' });
    await Promise.all([
      Notification.create({ user: dispute.raisedBy, type: 'payment_received', title: 'Dispute Resolved', message: 'Outcome: ' + req.body.outcome }),
      Notification.create({ user: dispute.against, type: 'payment_received', title: 'Dispute Resolved', message: 'Outcome: ' + req.body.outcome })
    ]);
    res.json({ success: true, dispute });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPendingGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ isApproved: false }).populate('client', 'name email avatar').sort({ createdAt: -1 });
    res.json({ success: true, gigs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getFlaggedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isFlagged: true })
      .populate('reviewer', 'name avatar').populate('reviewee', 'name avatar').populate('gig', 'title');
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
