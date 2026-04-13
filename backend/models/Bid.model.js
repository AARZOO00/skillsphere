// backend/models/bid.model.js
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  gig: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Gig',
    required: true,
    index:    true,
  },
  freelancer: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },
  amount:      { type: Number, required: true, min: 0 },
  deliveryDays:{ type: Number, required: true, min: 1 },
  coverLetter: { type: String, required: true, trim: true, maxlength: 2000 },
  status: {
    type:    String,
    enum:    ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
    index:   true,
  },
  milestones: [{
    title:       { type: String, required: true },
    description: String,
    amount:      { type: Number, default: 0 },
    dueDate:     Date,
    status:      { type: String, enum: ['pending','in-progress','completed'], default: 'pending' },
  }],
  attachments: [{ type: String }],
  acceptedAt:  Date,
  rejectedAt:  Date,
}, { timestamps: true });

// One freelancer can only bid once per gig
bidSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.models.Bid || mongoose.model('Bid', bidSchema);