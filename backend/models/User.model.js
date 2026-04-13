// backend/models/user.model.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, select: false },

  // OAuth
  googleId:     { type: String, unique: true, sparse: true },
  githubId:     { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local','google','github'], default: 'local' },

  role:   { type: String, enum: ['client','freelancer','admin'], default: 'freelancer' },
  avatar: { type: String, default: '' },
  bio:    { type: String, default: '', maxlength: 1000 },
  title:  { type: String, default: '' },

  skills:     [{ type: String }],
  hourlyRate: { type: Number, default: 0 },
  location: {
    city:        String,
    state:       String,
    country:     { type: String, default: 'India' },
    coordinates: { type: [Number], index: '2dsphere' },
  },

  // Stats
  rating:            { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:       { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  responseTime:      { type: String, default: '< 1 hour' },

  // Auth
  isVerified:      { type: Boolean, default: false },
  isOnline:        { type: Boolean, default: false },
  isFeatured:      { type: Boolean, default: false },
  isPro:           { type: Boolean, default: false },
  status:          { type: String, enum: ['active','suspended','pending'], default: 'active' },

  // Verification tokens
  emailVerifyToken:  String,
  emailVerifyExpiry: Date,
  resetPasswordToken:  String,
  resetPasswordExpiry: Date,

  // Subscription
  subscriptionPlan:   { type: String, enum: ['free','pro','elite'], default: 'free' },
  subscriptionStatus: { type: String, default: 'inactive' },

  // Referral & Rewards
  referralCode: { type: String, unique: true, sparse: true },
  credits:      { type: Number, default: 0 },

  // 2FA
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret:  { type: String, select: false },

  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

// ── Password hashing ──────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt   = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) { next(err); }
});

// ── Compare password ──────────────────────────────────────────
userSchema.methods.comparePassword = async function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

// ── Safe user object (no password) ───────────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.emailVerifyToken;
  delete obj.resetPasswordToken;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);