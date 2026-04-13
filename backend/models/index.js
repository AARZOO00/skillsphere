// backend/models/index.js
// Central model registry — safe to require from anywhere
// All schemas defined inline so no file-not-found errors

const mongoose = require('mongoose');
let   bcrypt;
try { bcrypt = require('bcryptjs'); } 
catch { try { bcrypt = require('bcrypt'); } catch { bcrypt = null; } }

// ── User ──────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password:     { type: String, select: false },
  googleId:     { type: String, unique: true, sparse: true },
  githubId:     { type: String, unique: true, sparse: true },
  authProvider: { type: String, default: 'local' },
  role:         { type: String, enum: ['client','freelancer','admin'], default: 'freelancer' },
  avatar:       { type: String, default: '' },
  bio:          { type: String, default: '' },
  title:        { type: String, default: '' },
  skills:       [String],
  hourlyRate:   { type: Number, default: 0 },
  location:     { city: String, state: String, country: { type: String, default: 'India' } },
  rating:            { type: Number, default: 0 },
  reviewCount:       { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  isVerified:        { type: Boolean, default: false },
  isOnline:          { type: Boolean, default: false },
  isFeatured:        { type: Boolean, default: false },
  isPro:             { type: Boolean, default: false },
  status:            { type: String, default: 'active' },
  subscriptionPlan:  { type: String, default: 'free' },
  referralCode:      { type: String, unique: true, sparse: true },
  credits:           { type: Number, default: 0 },
  emailVerifyToken:  String,
  resetPasswordToken: String,
  twoFactorEnabled:  { type: Boolean, default: false },
  twoFactorSecret:   { type: String, select: false },
  lastSeen:          { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password || !bcrypt) return next();
  try { const salt = await bcrypt.genSalt(12); this.password = await bcrypt.hash(this.password, salt); next(); }
  catch(err) { next(err); }
});
userSchema.methods.comparePassword = async function(plain) {
  if (!this.password || !bcrypt) return false;
  return bcrypt.compare(plain, this.password);
};

// ── Gig ───────────────────────────────────────────────────────
const gigSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  category:        { type: String, required: true },
  description:     { type: String, required: true },
  requirements:    { type: String, default: '' },
  skills:          [String],
  budget:          { type: Number, required: true, min: 0 },
  budgetType:      { type: String, enum: ['fixed','hourly'], default: 'fixed' },
  workType:        { type: String, default: 'remote' },
  experienceLevel: { type: String, default: 'entry' },
  duration:        { type: String, default: '' },
  status:          { type: String, enum: ['open','active','closed','cancelled'], default: 'open' },
  visibility:      { type: String, default: 'public' },
  client:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bidsCount:       { type: Number, default: 0 },
  views:           { type: Number, default: 0 },
}, { timestamps: true });

// ── Bid ───────────────────────────────────────────────────────
const bidSchema = new mongoose.Schema({
  gig:          { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  freelancer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:       { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  coverLetter:  { type: String, required: true },
  status:       { type: String, enum: ['pending','accepted','rejected','withdrawn'], default: 'pending' },
}, { timestamps: true });
bidSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

// ── Notification ──────────────────────────────────────────────
const notifSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:    { type: String, default: 'system' },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: '/' },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

// ── Payment ───────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gig:         { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
  amount:      { type: Number, required: true },
  type:        { type: String, default: 'credit' },
  status:      { type: String, default: 'completed' },
  description: String,
  razorpayId:  String,
  currency:    { type: String, default: 'INR' },
}, { timestamps: true });

// ── Conversation + Message (Chat) ─────────────────────────────
const convSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage:  { content: String, sender: mongoose.Schema.Types.ObjectId, createdAt: Date },
  gigId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
}, { timestamps: true });

const msgSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:      { type: String, required: true },
  readBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// ── Subscription ──────────────────────────────────────────────
const subSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:    { type: String, enum: ['free','pro','elite'], default: 'free' },
  status:  { type: String, enum: ['active','cancelled','expired','trial'], default: 'trial' },
  endDate: Date,
  autoRenew: { type: Boolean, default: true },
}, { timestamps: true });

// ── Export all models (use existing or create new) ────────────
module.exports = {
  User:         mongoose.models.User         || mongoose.model('User',         userSchema),
  Gig:          mongoose.models.Gig          || mongoose.model('Gig',          gigSchema),
  Bid:          mongoose.models.Bid          || mongoose.model('Bid',          bidSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', notifSchema),
  Payment:      mongoose.models.Payment      || mongoose.model('Payment',      paymentSchema),
  Conversation: mongoose.models.Conversation || mongoose.model('Conversation', convSchema),
  Message:      mongoose.models.Message      || mongoose.model('Message',      msgSchema),
  Subscription: mongoose.models.Subscription || mongoose.model('Subscription', subSchema),
};