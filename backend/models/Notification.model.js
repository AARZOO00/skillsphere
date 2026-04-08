// models/Notification.model.js
// Fixed: CommonJS format (module.exports) — no named exports issue

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['new_gig', 'new_bid', 'bid_accepted', 'bid_rejected', 'message', 'system'],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: '/' },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;