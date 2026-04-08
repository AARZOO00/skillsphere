// backend/socket/videoSignaling.js
// WebRTC signaling server using Socket.IO
// Attach to your existing io instance in server.js

// ── How to attach in server.js ───────────────────────────────
// const { setupVideoSignaling } = require('./socket/videoSignaling');
// setupVideoSignaling(io);
// ─────────────────────────────────────────────────────────────

const rooms = new Map(); // roomId → Map(socketId → { name, userId })

const setupVideoSignaling = (io) => {

  io.on('connection', (socket) => {

    // ── JOIN ROOM ──────────────────────────────────────────────
    socket.on('join-room', ({ roomId, userId, name }) => {
      socket.join(roomId);
      socket.data.roomId  = roomId;
      socket.data.userId  = userId;
      socket.data.name    = name || 'Guest';

      // Track room participants
      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      const room = rooms.get(roomId);

      // Tell the new joiner who's already in the room
      const existingPeers = [...room.keys()].filter(id => id !== socket.id);
      socket.emit('room-joined', { existingPeers, roomSize: room.size });

      // Tell existing participants that someone new joined
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        name,
        roomSize: room.size + 1,
      });

      room.set(socket.id, { name, userId });

      console.log(`[Video] ${name} joined room ${roomId} (${room.size} participants)`);
    });

    // ── WEBRTC SIGNAL ──────────────────────────────────────────
    // Relay ICE candidates and SDP between peers
    socket.on('signal', ({ signal, to, from, name }) => {
      io.to(to).emit('signal', {
        signal,
        from: socket.id,
        name: socket.data.name || name,
      });
    });

    // ── IN-CALL CHAT ───────────────────────────────────────────
    socket.on('chat-message', ({ roomId: rid, text, name: senderName }) => {
      socket.to(rid || socket.data.roomId).emit('chat-message', {
        text,
        from:  socket.id,
        name:  socket.data.name || senderName,
        time:  new Date(),
      });
    });

    // ── LEAVE ROOM ─────────────────────────────────────────────
    socket.on('leave-room', ({ roomId: rid }) => {
      handleLeave(socket, rid || socket.data.roomId, io);
    });

    // ── DISCONNECT ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      handleLeave(socket, socket.data.roomId, io);
    });

    // ── QUALITY SIGNAL (optional) ──────────────────────────────
    socket.on('quality-report', ({ roomId: rid, level }) => {
      socket.to(rid || socket.data.roomId).emit('quality', { level, from: socket.id });
    });

    // ── RAISE HAND (bonus feature) ─────────────────────────────
    socket.on('raise-hand', ({ roomId: rid }) => {
      socket.to(rid || socket.data.roomId).emit('hand-raised', { from: socket.id, name: socket.data.name });
    });

    // ── REACTION ───────────────────────────────────────────────
    socket.on('reaction', ({ roomId: rid, emoji }) => {
      socket.to(rid || socket.data.roomId).emit('reaction', { from: socket.id, name: socket.data.name, emoji });
    });
  });
};

function handleLeave(socket, roomId, io) {
  if (!roomId) return;
  socket.leave(roomId);
  const room = rooms.get(roomId);
  if (room) {
    room.delete(socket.id);
    io.to(roomId).emit('user-left', {
      userId: socket.id,
      name:   socket.data.name,
      remaining: room.size,
    });
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`[Video] Room ${roomId} closed (empty)`);
    }
  }
  console.log(`[Video] ${socket.data.name} left room ${roomId}`);
}

module.exports = { setupVideoSignaling };