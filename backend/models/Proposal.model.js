const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  gig:          { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  freelancer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter:  { type: String, required: true },
  bidAmount:    { type: Number, required: true },
  estimatedDays:{ type: Number, required: true },
  milestones:   [{ title: String, description: String, amount: Number, dueDate: Date }],
  attachments:  [{ name: String, url: String }],
  status:       { type: String, enum: ['pending','accepted','rejected','withdrawn','negotiating'], default: 'pending' },
  negotiationHistory: [{
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number, message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isShortlisted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
