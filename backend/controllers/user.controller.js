const User = require('../models/User.model');
const Freelancer = require('../models/Freelancer.model');
const Payment = require('../models/Payment.model');
const Proposal = require('../models/Proposal.model');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    let freelancer = null;
    if (user.role === 'freelancer') {
      freelancer = await Freelancer.findOne({ user: user._id });
      if (freelancer) { freelancer.profileViews++; await freelancer.save({ validateBeforeSave: false }); }
    }
    res.json({ success: true, user, freelancer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, state, country } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (city)  updates['location.city'] = city;
    if (state) updates['location.state'] = state;
    if (country) updates['location.country'] = country;
    if (req.file) updates.avatar = req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateFreelancerProfile = async (req, res) => {
  try {
    const allowed = ['title','bio','hourlyRate','skills','languages','certifications'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const freelancer = await Freelancer.findOneAndUpdate({ user: req.user._id }, { $set: updates }, { new: true, runValidators: true });
    if (!freelancer) return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    res.json({ success: true, freelancer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addPortfolioItem = async (req, res) => {
  try {
    const item = { title: req.body.title, description: req.body.description, link: req.body.link, tech: req.body.tech ? JSON.parse(req.body.tech) : [] };
    if (req.file) item.image = req.file.path;
    const freelancer = await Freelancer.findOneAndUpdate({ user: req.user._id }, { $push: { portfolio: item } }, { new: true });
    res.json({ success: true, freelancer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addExperience = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOneAndUpdate({ user: req.user._id }, { $push: { experience: req.body } }, { new: true });
    res.json({ success: true, freelancer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateAvailability = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOneAndUpdate(
      { user: req.user._id },
      { 'availability.status': req.body.status, ...(req.body.slots && { 'availability.slots': req.body.slots }) },
      { new: true }
    );
    res.json({ success: true, freelancer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const freelancer = await Freelancer.findOneAndUpdate({ user: req.user._id }, { resume: req.file.path }, { new: true });
    res.json({ success: true, freelancer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.searchFreelancers = async (req, res) => {
  try {
    const { skills, city, minRate, maxRate, rating, availability, page = 1, limit = 12 } = req.query;
    const query = {};
    if (skills) query['skills.name'] = { $in: skills.split(',').map(s => s.trim()) };
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }
    if (rating) query.reputationScore = { $gte: Number(rating) };
    if (availability) query['availability.status'] = availability;

    let freelancers = await Freelancer.find(query)
      .populate({ path: 'user', match: city ? { 'location.city': new RegExp(city, 'i') } : {}, select: 'name avatar location lastSeen' })
      .sort({ reputationScore: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    freelancers = freelancers.filter(f => f.user !== null);
    res.json({ success: true, freelancers, total: freelancers.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getFreelancerAnalytics = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) return res.status(404).json({ success: false, message: 'Not found' });

    const [earnings, proposalStats] = await Promise.all([
      Payment.aggregate([
        { $match: { freelancer: req.user._id, status: 'released' } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, amount: { $sum: '$freelancerAmount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 }
      ]),
      Proposal.aggregate([
        { $match: { freelancer: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.json({ success: true, analytics: {
      monthlyEarnings: earnings, proposalStats,
      totalEarnings: freelancer.totalEarnings,
      completedProjects: freelancer.completedProjects,
      reputationScore: freelancer.reputationScore,
      profileViews: freelancer.profileViews,
      successRate: freelancer.successRate
    }});
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) return res.status(400).json({ success: false, message: 'Use Google login instead' });
    const ok = await user.matchPassword(req.body.currentPassword);
    if (!ok) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
