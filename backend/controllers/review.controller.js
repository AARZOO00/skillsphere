const mongoose = require('mongoose');
const Review = require('../models/Review.model');
const Freelancer = require('../models/Freelancer.model');
const Notification = require('../models/Notification.model');

const recalcReputation = async (userId) => {
  const reviews = await Review.find({ reviewee: userId, isFlagged: false });
  if (!reviews.length) return 0;
  let weighted = 0, totalW = 0;
  reviews.forEach((r, i) => {
    const w = 1 + i / reviews.length;
    const avg = r.categories ? (r.categories.communication + r.categories.quality + r.categories.timeliness + r.categories.expertise) / 4 : r.rating;
    weighted += avg * w; totalW += w;
  });
  return Math.round(weighted / totalW * 10) / 10;
};

exports.createReview = async (req, res) => {
  try {
    const { gigId, revieweeId, rating, comment, categories } = req.body;
    const existing = await Review.findOne({ gig: gigId, reviewer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });
    const age = (Date.now() - req.user.createdAt) / 86400000;
    const isFlagged = age < 7 && rating === 5;
    const review = await Review.create({ gig: gigId, reviewer: req.user._id, reviewee: revieweeId, rating, comment, categories: categories || {}, isVerified: true, isFlagged });
    const score = await recalcReputation(revieweeId);
    await Freelancer.findOneAndUpdate({ user: revieweeId }, { reputationScore: score });
    await Notification.create({ user: revieweeId, type: 'review_added', title: 'New Review!', message: 'You received a ' + rating + '-star review' });
    req.app.get('io').to('user_' + revieweeId).emit('notification', { type: 'new_review', rating });
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const [reviews, stats] = await Promise.all([
      Review.find({ reviewee: req.params.userId, isFlagged: false })
        .populate('reviewer', 'name avatar').populate('gig', 'title')
        .sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      Review.aggregate([
        { $match: { reviewee: new mongoose.Types.ObjectId(req.params.userId), isFlagged: false } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } }
      ])
    ]);
    res.json({ success: true, reviews, stats: stats[0] || { avgRating: 0, total: 0 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.respondToReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(review.reviewee) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });
    review.response = { content: req.body.content, createdAt: new Date() };
    await review.save();
    res.json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.flagReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isFlagged: true, flagReason: req.body.reason }, { new: true });
    res.json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
