// backend/routes/notification.routes.js

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

// Inline schema
let Notification;
try {
  Notification = require('../models/index').Notification;
} catch {
  const schema = new mongoose.Schema({
    user:    { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true, index:true },
    type:    { type:String, enum:['new_gig','new_bid','bid_accepted','bid_rejected','message','payment','system'], default:'system' },
    title:   { type:String, required:true },
    message: { type:String, required:true },
    link:    { type:String, default:'/' },
    isRead:  { type:Boolean, default:false },
  }, { timestamps:true });
  Notification = mongoose.models.Notification || mongoose.model('Notification', schema);
}

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ notifications: notifs });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/notifications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;