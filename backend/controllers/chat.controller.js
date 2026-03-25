const { Message, Conversation } = require('../models/Message.model');

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId, gigId } = req.body;
    let conv = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
      ...(gigId ? { gig: gigId } : {})
    }).populate('participants', 'name avatar lastSeen role').populate('lastMessage');

    if (!conv) {
      conv = await Conversation.create({ participants: [req.user._id, userId], ...(gigId ? { gig: gigId } : {}) });
      await conv.populate('participants', 'name avatar lastSeen role');
    }
    res.json({ success: true, conversation: conv });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getConversations = async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.user._id, isActive: true })
      .populate('participants', 'name avatar lastSeen role')
      .populate('lastMessage')
      .populate('gig', 'title')
      .sort({ updatedAt: -1 });
    res.json({ success: true, conversations: convs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ conversation: req.params.conversationId, isDeleted: false })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    await Message.updateMany(
      { conversation: req.params.conversationId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $push: { readBy: req.user._id } }
    );
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type } = req.body;
    const attachments = req.files ? req.files.map(f => ({ name: f.originalname, url: f.path, type: f.mimetype })) : [];
    const message = await Message.create({ conversation: conversationId, sender: req.user._id, content, type: type || 'text', attachments, readBy: [req.user._id] });
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() });
    await message.populate('sender', 'name avatar');
    req.app.get('io').to('conv_' + conversationId).emit('new_message', message);
    res.status(201).json({ success: true, message });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(msg.sender) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });
    msg.isDeleted = true; msg.content = 'This message was deleted';
    await msg.save();
    req.app.get('io').to('conv_' + msg.conversation).emit('message_deleted', { messageId: msg._id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
