const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  gig:        { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  client:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:     { type: Number, required: true },
  currency:   { type: String, default: 'INR' },
  type:       { type: String, enum: ['full','milestone','refund'], default: 'full' },
  milestone:  { title: String, index: Number },
  status:     { type: String, enum: ['pending','in_escrow','released','refunded','failed'], default: 'pending' },
  razorpayOrderId:   String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  platformFee:      { type: Number, default: 0 },
  freelancerAmount: { type: Number, default: 0 },
  transactionId:    { type: String, unique: true, sparse: true },
  paidAt:     Date,
  releasedAt: Date,
  refundedAt: Date,
  refundReason: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
