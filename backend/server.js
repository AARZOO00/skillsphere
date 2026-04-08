const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');
const { setupVideoSignaling } = require('./socket/videoSignaling');
const session = require('express-session');


// After creating io:



const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
// Attach video signaling
setupVideoSignaling(io);

// Make io available to routes (for notifications)
app.set('io', io);

app.set('io', io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests' } }));
app.use(session({ secret: process.env.SESSION_SECRET || 'ss_secret', resave: false, saveUninitialized: false }));
app.use(passport.session());

app.use('/api/auth/github', require('./routes/github.auth'));
app.use('/api/auth/google', require('./routes/google.auth'));
// Routes
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/gigs',          require('./routes/gig.routes'));
app.use('/api/proposals',     require('./routes/proposal.routes'));
app.use('/api/chat',          require('./routes/chat.routes'));
app.use('/api/payments',      require('./routes/payment.routes'));
app.use('/api/reviews',       require('./routes/review.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/disputes',      require('./routes/dispute.routes'));
app.use('/api/ai',            require('./routes/ai.routes'));

// Subscription routes
app.use('/api/subscription',  require('./routes/subscription.routes').router);

// Referral routes
app.use('/api/referral',      require('./routes/referral.routes').router);

// Smart Search routes
app.use('/api/search',        require('./routes/search.routes'));

// Notification routes
app.use('/api/notifications', require('./routes/notification.routes'));

// Video signaling — add AFTER creating `io`

app.set('io', io);
app.get('/', (req, res) => res.json({ success: true, message: 'SkillSphere API v1.0' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

// Socket.IO
require('./socket/socket')(io);

// Connect DB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('❌ MongoDB Error:', err.message); process.exit(1); });
