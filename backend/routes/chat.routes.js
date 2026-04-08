// backend/routes/chat.routes.js
// Complete chat system with Socket.IO real-time support

const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth.middleware');

// ── Schemas (defined inline to avoid import issues) ─────────────
const convSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage:  {
    content:   { type: String, default: '' },
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date },
  },
  gigId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
  unreadCounts: { type: Map, of: Number, default: new Map() },
}, { timestamps: true });

const msgSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:      { type: String, required: true, trim: true },
  readBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type:         { type: String, enum: ['text', 'file', 'system'], default: 'text' },
}, { timestamps: true });

// Use existing models or create new ones
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', convSchema);
const Message      = mongoose.models.Message      || mongoose.model('Message',      msgSchema);

// ── Helper: get or create conversation ──────────────────────────
const getOrCreate = async (user1, user2, gigId) => {
  const query = { participants: { $all: [user1, user2], $size: 2 } };
  if (gigId) query.gigId = gigId;

  let conv = await Conversation.findOne(query);
  if (!conv) {
    conv = await Conversation.create({ participants: [user1, user2], gigId: gigId || undefined });
  }
  return conv;
};

// ── Helper: emit socket event ────────────────────────────────────
const emit = (req, event, room, data) => {
  try {
    const io = req.app.get('io');
    if (io) io.to(room).emit(event, data);
  } catch { /* socket not available */ }
};

// ════════════════════════════════════════════════════════════════
// GET /api/chat  — list all conversations for logged-in user
// ════════════════════════════════════════════════════════════════
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar isOnline title location')
      .sort({ updatedAt: -1 })
      .lean();

    // Add unread count per conversation
    const withUnread = await Promise.all(conversations.map(async (conv) => {
      try {
        const unread = await Message.countDocuments({
          conversation: conv._id,
          sender:       { $ne: req.user._id },
          readBy:       { $ne: req.user._id },
        });
        return { ...conv, unread };
      } catch {
        return { ...conv, unread: 0 };
      }
    }));

    res.json({ conversations: withUnread });
  } catch (err) {
    console.error('GET /chat error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/chat/start  — start or retrieve conversation
// Body: { userId, gigId? }
// ════════════════════════════════════════════════════════════════
router.post('/start', protect, async (req, res) => {
  try {
    const { userId, gigId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const myId = req.user._id.toString();
    if (userId === myId) return res.status(400).json({ message: 'Cannot start chat with yourself' });

    // Validate userId is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: 'Invalid userId' });

    const conv = await getOrCreate(req.user._id, userId, gigId);
    const populated = await Conversation.findById(conv._id)
      .populate('participants', 'name avatar isOnline title location');

    res.json({ conversation: populated });
  } catch (err) {
    console.error('POST /chat/start error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// GET /api/chat/:id  — get messages for a conversation
// ════════════════════════════════════════════════════════════════
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid conversation ID', messages: [] });

    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Conversation not found', messages: [] });

    // Check user is a participant
    const isParticipant = conv.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized', messages: [] });

    // Fetch messages — wrap in try/catch in case collection is empty
    let messages = [];
    try {
      messages = await Message.find({ conversation: req.params.id })
        .populate('sender', 'name avatar')
        .sort({ createdAt: 1 })
        .lean();
    } catch (msgErr) {
      console.error('Message fetch error:', msgErr.message);
      messages = [];
    }

    // Mark as read (non-blocking)
    Message.updateMany(
      { conversation: req.params.id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    ).catch(() => {});

    res.json({ messages });
  } catch (err) {
    console.error('GET /chat/:id error:', err.message);
    // Return empty messages instead of crashing
    res.status(500).json({ message: err.message, messages: [] });
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/chat/:id  — send a message
// Body: { content }
// ════════════════════════════════════════════════════════════════
router.post('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid conversation ID' });

    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message content cannot be empty' });

    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    const isParticipant = conv.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    // Create message
    const message = await Message.create({
      conversation: req.params.id,
      sender:       req.user._id,
      content:      content.trim(),
      readBy:       [req.user._id],
    });

    // Update conversation
    conv.lastMessage = { content: content.trim(), sender: req.user._id, createdAt: new Date() };
    conv.updatedAt   = new Date();
    await conv.save();

    // Populate sender
    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .lean();

    // Real-time: notify other participants via Socket.IO
    const others = conv.participants.filter(p => p.toString() !== req.user._id.toString());
    others.forEach(userId => {
      emit(req, 'new_message', `user_${userId}`, {
        conversationId: req.params.id,
        message: populated,
      });
    });

    res.status(201).json({ message: populated });
  } catch (err) {
    console.error('POST /chat/:id error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// PATCH /api/chat/:id/read  — mark all messages as read
// ════════════════════════════════════════════════════════════════
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { conversation: req.params.id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// DELETE /api/chat/:id  — delete a conversation
// ════════════════════════════════════════════════════════════════
router.delete('/:id', protect, async (req, res) => {
  try {
    await Message.deleteMany({ conversation: req.params.id });
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;