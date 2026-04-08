const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:      { type: String, default: '' },
  attachments:  [{ name: String, url: String, type: String }],
  type:         { type: String, enum: ['text','file','image','system'], default: 'text' },
  readBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted:    { type: Boolean, default: false }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  gig:          { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
  lastMessage:  { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
module.exports = { Message, Conversation };
