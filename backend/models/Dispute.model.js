const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  gig:        { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  raisedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  against:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason:     { type: String, required: true },
  description:{ type: String, required: true },
  evidence:   [{ name: String, url: String }],
  status:     { type: String, enum: ['open','under_review','resolved','closed'], default: 'open' },
  resolution: {
    outcome: String, adminNote: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date
  },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
