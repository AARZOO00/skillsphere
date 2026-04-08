const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  gig:      { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, required: true },
  categories: {
    communication: { type: Number, min: 1, max: 5 },
    quality:       { type: Number, min: 1, max: 5 },
    timeliness:    { type: Number, min: 1, max: 5 },
    expertise:     { type: Number, min: 1, max: 5 }
  },
  isVerified: { type: Boolean, default: true },
  isFlagged:  { type: Boolean, default: false },
  flagReason: String,
  response:   { content: String, createdAt: Date },
  helpfulVotes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
