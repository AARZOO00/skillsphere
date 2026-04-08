// backend/routes/search.routes.js
// Smart search with MongoDB Atlas text search + autocomplete + skill suggestions

const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');

// ── All skills pool for suggestions ──────────────────────────
const ALL_SKILLS = [
  'React.js','Next.js','Vue.js','Angular','TypeScript','JavaScript','HTML','CSS','TailwindCSS',
  'Node.js','Express.js','NestJS','Python','Django','FastAPI','Flask','PHP','Laravel',
  'MongoDB','PostgreSQL','MySQL','Redis','Firebase','Supabase','GraphQL','REST API',
  'React Native','Flutter','iOS','Android','Swift','Kotlin','Dart',
  'AWS','Google Cloud','Azure','Docker','Kubernetes','Terraform','CI/CD','DevOps','Linux',
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','NLP','Computer Vision','Data Science',
  'Figma','Adobe XD','Sketch','UI Design','UX Design','Prototyping','Wireframing','Brand Identity',
  'WordPress','Shopify','WooCommerce','Webflow','SEO','Google Ads','Social Media','Email Marketing',
  'Video Editing','Motion Graphics','After Effects','Premiere Pro','Animation','3D Modeling',
  'Content Writing','Technical Writing','Copywriting','Blog Writing','Translation',
  'Blockchain','Solidity','Web3','NFT','DeFi','Ethereum','Smart Contracts',
  'Unity','Unreal Engine','Game Development','AR/VR',
];

// ══════════════════════════════════════════════════════════════
// GET /api/search?q=react&type=gigs&page=1&limit=20
// Universal search: gigs, freelancers, or both
// ══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const { q = '', type = 'all', category, experience, workType, minBudget, maxBudget, page = 1, limit = 20, sort = 'relevance' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const results = {};

    if (!q.trim() && !category) {
      return res.json({ gigs: [], freelancers: [], total: 0, suggestions: [] });
    }

    // ── Build text search query ────────────────────────────────
    const textQuery = q.trim()
      ? { $text: { $search: q, $caseSensitive: false, $diacriticSensitive: false } }
      : {};

    // ── Search GIGS ────────────────────────────────────────────
    if (type === 'all' || type === 'gigs') {
      const Gig = require('../models/gig.model');
      const gigFilter = {
        status: { $in: ['open','active'] },
        visibility: 'public',
        ...textQuery,
      };
      if (category)   gigFilter.category = category;
      if (experience) gigFilter.experienceLevel = experience;
      if (workType)   gigFilter.workType = workType;
      if (minBudget || maxBudget) {
        gigFilter.budget = {};
        if (minBudget) gigFilter.budget.$gte = Number(minBudget);
        if (maxBudget) gigFilter.budget.$lte = Number(maxBudget);
      }

      // Fallback to regex if no text index
      if (q.trim() && !textQuery.$text) {
        const re = new RegExp(q.trim(), 'i');
        gigFilter.$or = [{ title: re }, { description: re }, { skills: { $in: [re] } }];
        delete gigFilter.$text;
      }

      const sortMap = {
        relevance:  q.trim() ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 },
        newest:     { createdAt: -1 },
        budget_hi:  { budget: -1 },
        budget_lo:  { budget: 1 },
        bids_lo:    { bidsCount: 1 },
      };

      const [gigs, gigTotal] = await Promise.all([
        Gig.find(gigFilter, q.trim() ? { score: { $meta: 'textScore' } } : {})
          .populate('client', 'name avatar rating location isVerified')
          .sort(sortMap[sort] || sortMap.relevance)
          .skip(skip).limit(Number(limit)).lean(),
        Gig.countDocuments(gigFilter),
      ]);

      // Attach bid counts
      const Bid = require('../models/bid.model');
      const withBids = await Promise.all(gigs.map(async g => {
        try {
          const bc = await Bid.countDocuments({ gig: g._id });
          return { ...g, bidsCount: bc };
        } catch { return g; }
      }));

      results.gigs      = withBids;
      results.gigTotal  = gigTotal;
    }

    // ── Search FREELANCERS ─────────────────────────────────────
    if (type === 'all' || type === 'freelancers') {
      const User = require('../models/User.model');
      const userFilter = { role: 'freelancer', status: 'active' };

      if (q.trim()) {
        const re = new RegExp(q.trim(), 'i');
        userFilter.$or = [
          { name: re }, { title: re },
          { bio: re }, { skills: { $in: [re] } },
        ];
      }
      if (minBudget) userFilter.hourlyRate = { $gte: Number(minBudget) / 100 };

      const userSortMap = {
        relevance: { isFeatured: -1, rating: -1, completedProjects: -1 },
        rating:    { rating: -1 },
        price_lo:  { hourlyRate: 1 },
        price_hi:  { hourlyRate: -1 },
        newest:    { createdAt: -1 },
      };

      const [freelancers, flTotal] = await Promise.all([
        User.find(userFilter)
          .select('name title avatar location rating reviewCount completedProjects hourlyRate skills isOnline isVerified isFeatured isPro responseTime')
          .sort(userSortMap[sort] || userSortMap.relevance)
          .skip(skip).limit(Number(limit)).lean(),
        User.countDocuments(userFilter),
      ]);

      results.freelancers  = freelancers;
      results.freelancerTotal = flTotal;
    }

    results.total = (results.gigTotal || 0) + (results.freelancerTotal || 0);
    results.page  = Number(page);
    results.query = q;

    res.json(results);
  } catch(err) {
    console.error('Search error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/search/autocomplete?q=rea
// Returns: skill suggestions + job title completions
// ══════════════════════════════════════════════════════════════
router.get('/autocomplete', async (req, res) => {
  try {
    const { q = '', limit = 8 } = req.query;
    if (!q.trim() || q.length < 2) {
      return res.json({ suggestions: [], skills: [], popular: getPopularSearches() });
    }

    const re = new RegExp('^' + escapeRegex(q), 'i');

    // 1. Skill suggestions from pool
    const skills = ALL_SKILLS
      .filter(s => re.test(s) || s.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 6)
      .map(s => ({ text: s, type: 'skill', icon: '🔧' }));

    // 2. Job title suggestions from DB
    let titleSuggestions = [];
    try {
      const Gig = require('../models/gig.model');
      const titleRe = new RegExp(escapeRegex(q), 'i');
      const gigs = await Gig.find({ title: titleRe, status: 'open' })
        .select('title category')
        .limit(5)
        .lean();
      titleSuggestions = gigs.map(g => ({ text: g.title, type: 'job', icon: '💼', category: g.category }));
    } catch {}

    // 3. Freelancer name suggestions
    let peopleSuggestions = [];
    try {
      const User = require('../models/User.model');
      const nameRe = new RegExp(escapeRegex(q), 'i');
      const people = await User.find({ role: 'freelancer', name: nameRe, status: 'active' })
        .select('name title avatar')
        .limit(3)
        .lean();
      peopleSuggestions = people.map(p => ({ text: p.name, subtext: p.title, type: 'person', icon: '👤', avatar: p.avatar }));
    } catch {}

    const all = [...skills, ...titleSuggestions, ...peopleSuggestions].slice(0, Number(limit));

    res.json({
      suggestions: all,
      skills:      skills.map(s => s.text),
      query:       q,
    });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/search/trending — trending skills + searches
// ══════════════════════════════════════════════════════════════
router.get('/trending', async (req, res) => {
  try {
    // Top skills from recent gigs
    let trendingSkills = [];
    try {
      const Gig = require('../models/gig.model');
      const result = await Gig.aggregate([
        { $match: { status: 'open', createdAt: { $gte: new Date(Date.now() - 30*86400000) } } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]);
      trendingSkills = result.map(r => ({ skill: r._id, count: r.count }));
    } catch {}

    if (trendingSkills.length === 0) {
      trendingSkills = [
        { skill:'React.js',    count:38 }, { skill:'Node.js',     count:31 },
        { skill:'Python',      count:27 }, { skill:'Flutter',     count:22 },
        { skill:'Figma',       count:19 }, { skill:'AWS',         count:17 },
        { skill:'TypeScript',  count:15 }, { skill:'Next.js',     count:14 },
        { skill:'MongoDB',     count:12 }, { skill:'PostgreSQL',  count:11 },
        { skill:'Docker',      count:9  }, { skill:'GraphQL',     count:8  },
      ];
    }

    res.json({
      trending: trendingSkills,
      popular:  getPopularSearches(),
      categories: [
        { id:'webdev',     label:'Web Dev',     count:38 },
        { id:'mobile',     label:'Mobile',      count:24 },
        { id:'design',     label:'Design',      count:19 },
        { id:'datascience',label:'Data Science',count:16 },
        { id:'devops',     label:'DevOps',      count:11 },
        { id:'marketing',  label:'Marketing',   count:12 },
      ],
    });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/search/skill-suggestions?skills=React.js,Node.js
// Returns related skills to add to a search
// ══════════════════════════════════════════════════════════════
router.get('/skill-suggestions', async (req, res) => {
  try {
    const { skills = '' } = req.query;
    const current = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    // Skill co-occurrence from DB
    let related = [];
    try {
      const Gig = require('../models/gig.model');
      const currentRe = current.map(s => new RegExp(s, 'i'));
      const gigs = await Gig.find({ skills: { $in: currentRe }, status: 'open' }).select('skills').limit(200).lean();
      const freq = {};
      gigs.forEach(g => (g.skills || []).forEach(s => {
        if (!current.includes(s.toLowerCase())) freq[s] = (freq[s]||0) + 1;
      }));
      related = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([s,c])=>({ skill:s, count:c }));
    } catch {}

    if (related.length === 0 && current.length > 0) {
      const cat = current.includes('react.js')||current.includes('vue.js')||current.includes('angular')
        ? ['Node.js','TypeScript','MongoDB','Redux','GraphQL','TailwindCSS','Next.js']
        : current.includes('python') ? ['Django','FastAPI','PostgreSQL','Redis','Docker','TensorFlow','Pandas']
        : current.includes('flutter') ? ['Dart','Firebase','GetX','Bloc','REST API','SQLite']
        : ALL_SKILLS.filter(s => !current.includes(s.toLowerCase())).slice(0, 8);
      related = cat.map(s => ({ skill: s, count: Math.floor(Math.random()*10)+3 }));
    }

    res.json({ related, current });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPopularSearches = () => [
  { text:'React.js developer',   icon:'💻' },
  { text:'UI/UX Designer',        icon:'🎨' },
  { text:'Python ML engineer',    icon:'🤖' },
  { text:'Node.js backend',       icon:'⚙️' },
  { text:'Flutter developer',     icon:'📱' },
  { text:'DevOps AWS',            icon:'☁️' },
  { text:'Content writer',        icon:'✍️' },
  { text:'Figma designer',        icon:'🖼️' },
];

// ── Create MongoDB text indexes (run once) ────────────────────
const createIndexes = async () => {
  try {
    const Gig  = require('../models/gig.model');
    await Gig.collection.createIndex({ title:'text', description:'text', skills:'text' }, { weights:{ title:10, skills:5, description:1 } });
    console.log('[Search] Text indexes created on Gig collection');
  } catch(err) {
    // Index may already exist — safe to ignore
    if (!err.message?.includes('already')) console.warn('[Search] Index warning:', err.message);
  }
};

// Call on startup
createIndexes();

module.exports = router;