// ════════════════════════════════════════════════════════════════
// models/Gig.js
// ════════════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 120 },
  category:    { type: String, required: true, enum: ['webdev','mobile','design','datascience','marketing','writing','video','devops','consulting'] },
  description: { type: String, required: true, minlength: 50 },
  requirements:{ type: String, default: '' },
  skills:      [{ type: String, trim: true }],

  budget:       { type: Number, required: true, min: 0 },
  budgetType:   { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  deadline:     { type: Date },
  bidDeadline:  { type: Date },

  experienceLevel: { type: String, enum: ['beginner','intermediate','expert'], default: 'intermediate' },
  workType:        { type: String, enum: ['remote','onsite','hybrid'], default: 'remote' },
  visibility:      { type: String, enum: ['public','private'], default: 'public' },
  allowBids:       { type: Boolean, default: true },

  status: {
    type: String,
    enum: ['open', 'active', 'completed', 'closed', 'cancelled'],
    default: 'open',
  },

  client:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acceptedBid:        { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notifiedCount:      { type: Number, default: 0 },

}, { timestamps: true });

// Full-text search index
gigSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.models.Gig || mongoose.model('Gig', gigSchema);


// ════════════════════════════════════════════════════════════════
// models/Bid.js  — paste in a separate file
// ════════════════════════════════════════════════════════════════
/*
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  gig:          { type: mongoose.Schema.Types.ObjectId, ref: 'Gig',  required: true },
  freelancer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:       { type: Number, required: true, min: 0 },
  deliveryDays: { type: Number, required: true, min: 1 },
  proposal:     { type: String, required: true, minlength: 10 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
}, { timestamps: true });

// One bid per freelancer per gig
bidSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
*/