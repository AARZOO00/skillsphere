const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const onlineUsers = new Map();

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch { next(new Error('Auth failed')); }
  });

  io.on('connection', (socket) => {
    const uid = socket.user._id.toString();
    onlineUsers.set(uid, socket.id);
    socket.join('user_' + uid);
    socket.broadcast.emit('user_online', { userId: uid });
    console.log('Connected:', socket.user.name);

    socket.on('join_conversation', (convId) => socket.join('conv_' + convId));
    socket.on('leave_conversation', (convId) => socket.leave('conv_' + convId));

    socket.on('typing_start', ({ conversationId }) =>
      socket.to('conv_' + conversationId).emit('user_typing', { userId: uid, name: socket.user.name }));

    socket.on('typing_stop', ({ conversationId }) =>
      socket.to('conv_' + conversationId).emit('user_stop_typing', { userId: uid }));

    socket.on('message_read', ({ messageId, conversationId }) =>
      socket.to('conv_' + conversationId).emit('message_seen', { messageId, userId: uid }));

    // WebRTC video call signaling
    socket.on('call_offer', ({ to, offer }) => {
      const sid = onlineUsers.get(to);
      if (sid) io.to(sid).emit('incoming_call', { from: uid, offer, callerName: socket.user.name, callerAvatar: socket.user.avatar });
    });
    socket.on('call_answer', ({ to, answer }) => {
      const sid = onlineUsers.get(to);
      if (sid) io.to(sid).emit('call_answered', { answer });
    });
    socket.on('ice_candidate', ({ to, candidate }) => {
      const sid = onlineUsers.get(to);
      if (sid) io.to(sid).emit('ice_candidate', { candidate });
    });
    socket.on('call_end', ({ to }) => {
      const sid = onlineUsers.get(to);
      if (sid) io.to(sid).emit('call_ended');
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(uid);
      socket.broadcast.emit('user_offline', { userId: uid });
      await User.findByIdAndUpdate(uid, { lastSeen: new Date() });
      console.log('Disconnected:', socket.user.name);
    });
  });
};
