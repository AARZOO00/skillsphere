const Freelancer = require('../models/Freelancer.model');
const Gig = require('../models/gig.model');

const jaccard = (a, b) => {
  const setA = new Set(a.map(s => s.toLowerCase().trim()));
  const setB = new Set(b.map(s => s.toLowerCase().trim()));
  const inter = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : inter.size / union.size;
};

exports.matchFreelancers = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    const freelancers = await Freelancer.find({ 'availability.status': 'available' }).populate('user', 'name avatar location');
    const gigSkills = gig.skills || [];

    const scored = freelancers.map(f => {
      const fSkills = f.skills.map(s => s.name);
      const skillScore = jaccard(gigSkills, fSkills);
      const expertCount = f.skills.filter(s => s.level === 'expert').length;
      const expBonus = expertCount / Math.max(f.skills.length, 1);
      const ratingScore = f.reputationScore / 5;
      const completionBonus = f.successRate / 100;
      let locationBonus = 0;
      if (gig.location?.city && f.user?.location?.city)
        if (gig.location.city.toLowerCase() === f.user.location.city.toLowerCase()) locationBonus = 0.2;
      const finalScore = skillScore * 0.4 + ratingScore * 0.25 + expBonus * 0.15 + completionBonus * 0.1 + locationBonus * 0.1;
      const matchedSkills = gigSkills.filter(gs => fSkills.some(fs => fs.toLowerCase().includes(gs.toLowerCase())));
      return { freelancer: f, score: Math.round(finalScore * 100), skillMatch: Math.round(skillScore * 100), matchedSkills };
    });

    const top = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
    res.json({ success: true, matches: top });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.recommendGigs = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    const mySkills = freelancer.skills.map(s => s.name);
    const gigs = await Gig.find({ status: 'open', isApproved: true }).populate('client', 'name avatar location').sort({ createdAt: -1 }).limit(60);

    const scored = gigs.map(gig => {
      const skillMatch = jaccard(mySkills, gig.skills || []);
      const budgetFit = gig.budget.min >= freelancer.hourlyRate * 0.5 ? 1 : 0.5;
      const recency = Math.max(0, 1 - (Date.now() - gig.createdAt) / (7 * 86400000));
      let locationBonus = 0;
      if (req.user?.location?.city && gig.location?.city)
        if (req.user.location.city.toLowerCase() === gig.location.city.toLowerCase()) locationBonus = 0.15;
      const score = skillMatch * 0.5 + budgetFit * 0.2 + recency * 0.15 + locationBonus * 0.15;
      return { gig, score: Math.round(score * 100), skillMatch: Math.round(skillMatch * 100) };
    });

    const recs = scored.filter(s => s.score > 5).sort((a, b) => b.score - a.score).slice(0, 12);
    res.json({ success: true, recommendations: recs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getTrendingSkills = async (req, res) => {
  try {
    const skills = await Gig.aggregate([
      { $match: { status: 'open', createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 }, avgBudget: { $avg: '$budget.max' } } },
      { $sort: { count: -1 } }, { $limit: 15 }
    ]);
    res.json({ success: true, trendingSkills: skills });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
