// backend/routes/google.auth.js
// Google OAuth using passport-google-oauth20
//
// SETUP:
// 1. Go to https://console.cloud.google.com
// 2. Create project → Enable "Google+ API" or "Google Identity"
// 3. Credentials → Create OAuth 2.0 Client ID (Web application)
// 4. Authorized redirect URI: http://localhost:5000/api/auth/google/callback
// 5. Copy Client ID and Secret to .env
//
// Install: npm install passport passport-google-oauth20 express-session

const express         = require('express');
const passport        = require('passport');
const GoogleStrategy  = require('passport-google-oauth20').Strategy;
const router          = express.Router();
const jwt             = require('jsonwebtoken');

let User;
try {
  User = require('../models/User.model');
} catch {
  const mongoose = require('mongoose');
  User = mongoose.models.User;
}

// ── Google Strategy ────────────────────────────────────────
passport.use('google', new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email    = profile.emails?.[0]?.value;
    const name     = profile.displayName || 'Google User';
    const avatar   = profile.photos?.[0]?.value || '';

    // 1. Find by googleId
    let user = await User.findOne({ googleId });

    // 2. Link by email
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId    = googleId;
        user.avatar      = user.avatar || avatar;
        user.isVerified  = true;
        user.authProvider = 'google';
        await user.save();
      }
    }

    // 3. Create new
    if (!user) {
      const code = `SS-GL${googleId.slice(-5).toUpperCase()}`;
      user = await User.create({
        googleId,
        name,
        email:        email || `google_${googleId}@skillsphere.app`,
        avatar,
        role:         'freelancer',
        isVerified:   true,
        authProvider: 'google',
        referralCode: code,
        credits:      50,
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

const genToken = (user) => jwt.sign(
  { id: user._id, role: user.role, email: user.email },
  process.env.JWT_SECRET || 'skillsphere_secret_key',
  { expiresIn: '30d' }
);

// GET /api/auth/google
router.get('/', passport.authenticate('google', {
  scope:   ['profile', 'email'],
  session: false,
}));

// GET /api/auth/google/callback
router.get('/callback',
  passport.authenticate('google', {
    session:         false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`,
  }),
  (req, res) => {
    try {
      const user  = req.user;
      const token = genToken(user);

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
        authProvider:     'google',
      };

      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      const p = new URLSearchParams({ token, user: JSON.stringify(safeUser) });
      res.redirect(`${frontendURL}/oauth-success?${p.toString()}`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=server_error`);
    }
  }
);

module.exports = router;