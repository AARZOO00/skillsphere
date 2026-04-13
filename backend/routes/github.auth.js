// backend/routes/github.auth.js
// GitHub OAuth using passport-github2
//
// SETUP STEPS:
// 1. Go to https://github.com/settings/developers
// 2. Click "New OAuth App"
// 3. Fill in:
//    - Application name: SkillSphere
//    - Homepage URL: http://localhost:3000
//    - Authorization callback URL: http://localhost:5000/api/auth/github/callback
// 4. Copy Client ID and Client Secret to your .env file
//
// Install: npm install passport passport-github2 passport-google-oauth20 express-session

const express        = require('express');
const passport       = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const router         = express.Router();
const jwt            = require('jsonwebtoken');

// ── Load User model ────────────────────────────────────────
let User;
try {
  User = require('../models/index').User;
} catch {
  const mongoose = require('mongoose');
  const s = new mongoose.Schema({
    name:         String,
    email:        { type: String, unique: true, sparse: true },
    githubId:     { type: String, unique: true, sparse: true },
    googleId:     { type: String, unique: true, sparse: true },
    avatar:       String,
    role:         { type: String, enum: ['client','freelancer','admin'], default: 'freelancer' },
    isVerified:   { type: Boolean, default: false },
    referralCode: String,
    credits:      { type: Number, default: 0 },
    isPro:        { type: Boolean, default: false },
    subscriptionPlan: { type: String, default: 'free' },
    authProvider: { type: String, default: 'local' },
  }, { timestamps: true });
  User = mongoose.models.User || mongoose.model('User', s);
}

// ── GitHub Strategy ────────────────────────────────────────
passport.use('github', new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
  scope:        ['user:email'],
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const githubId = profile.id?.toString();

    // Get primary email from GitHub (may be in emails array)
    const rawEmail = profile.emails?.find(e => e.primary)?.value
                  || profile.emails?.[0]?.value
                  || null;

    const avatar  = profile.photos?.[0]?.value || '';
    const name    = profile.displayName || profile.username || 'GitHub User';

    // 1. Try find by githubId
    let user = await User.findOne({ githubId });

    // 2. Try find by email (link accounts)
    if (!user && rawEmail) {
      user = await User.findOne({ email: rawEmail });
      if (user) {
        user.githubId    = githubId;
        user.avatar      = user.avatar || avatar;
        user.isVerified  = true;
        user.authProvider = 'github';
        await user.save();
      }
    }

    // 3. Create new user
    if (!user) {
      // Generate unique referral code
      const code = `SS-GH${githubId.slice(-5).toUpperCase()}`;

      user = await User.create({
        githubId,
        name,
        email:        rawEmail || `github_${githubId}@skillsphere.app`,
        avatar,
        role:         'freelancer',
        isVerified:   true,
        authProvider: 'github',
        referralCode: code,
        credits:      50, // welcome bonus
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done)   => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) { done(e); }
});

// ── Helper: generate JWT ───────────────────────────────────
const genToken = (user) => jwt.sign(
  { id: user._id, role: user.role, email: user.email },
  process.env.JWT_SECRET || 'skillsphere_secret_key',
  { expiresIn: '30d' }
);

// ══════════════════════════════════════════════════════════
// GET /api/auth/github  — initiate GitHub OAuth
// ══════════════════════════════════════════════════════════
router.get('/', passport.authenticate('github', {
  scope: ['user:email'],
  session: false,
}));

// ══════════════════════════════════════════════════════════
// GET /api/auth/github/callback  — GitHub redirects here
// ══════════════════════════════════════════════════════════
router.get('/callback',
  passport.authenticate('github', {
    session:      false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=github_failed`,
  }),
  (req, res) => {
    try {
      const user  = req.user;
      const token = genToken(user);

      // Safe user object to send to frontend
      const safeUser = {
        _id:              user._id,
        name:             user.name,
        email:            user.email,
        avatar:           user.avatar,
        role:             user.role,
        isVerified:       user.isVerified,
        isPro:            user.isPro,
        subscriptionPlan: user.subscriptionPlan,
        credits:          user.credits,
        authProvider:     'github',
      };

      // Redirect to frontend with token in URL
      // Frontend will pick it up via OAuthSuccess page
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      const params      = new URLSearchParams({
        token,
        user: JSON.stringify(safeUser),
      });

      res.redirect(`${frontendURL}/oauth-success?${params.toString()}`);
    } catch (err) {
      console.error('GitHub callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=server_error`);
    }
  }
);

module.exports = router;