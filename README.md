# ⚡ SkillSphere — Complete MERN Freelance Platform

## 🚀 Setup in 5 Steps

### Step 1: Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Configure Backend
```bash
cd backend
cp .env.example .env
# Open .env and fill in all values
```

### Step 3: Required Services
| Service | How to Get |
|---|---|
| **MongoDB Atlas** | atlas.mongodb.com → Create cluster → Get connection string |
| **Cloudinary** | cloudinary.com → Dashboard → API keys |
| **Gmail App Password** | Google Account → Security → 2-Step → App Passwords |
| **Razorpay Test Keys** | dashboard.razorpay.com → Settings → API Keys (use TEST keys) |
| **Google OAuth** | console.cloud.google.com → Create project → OAuth 2.0 |
| **HuggingFace** | huggingface.co → Settings → Access Tokens |

### Step 4: Run
```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

### Step 5: Create Admin Account
1. Register normally on the site
2. Go to MongoDB Atlas → Browse Collections → users
3. Find your user and change `role` from `"client"` to `"admin"`
4. Login again

---

## 📁 Project Structure
```
skillsphere-final/
├── backend/
│   ├── config/           passport.js, cloudinary.js
│   ├── controllers/      auth, user, gig, proposal, chat, payment, review, ai, admin
│   ├── middleware/        auth.middleware.js (JWT + RBAC)
│   ├── models/           User, Freelancer, Gig, Proposal, Message, Payment, Review, Notification, Dispute
│   ├── routes/           11 route files
│   ├── socket/           socket.js (real-time + WebRTC)
│   ├── utils/            generateToken.js, sendEmail.js
│   └── server.js
│
└── frontend/
    ├── public/           index.html
    └── src/
        ├── components/   Navbar, ProtectedRoute
        ├── hooks/        useSocket.js, useAuth.js
        ├── pages/
        │   ├── auth/     Login, Register, VerifyEmail, ForgotPassword, ResetPassword, OAuthSuccess
        │   ├── client/   CreateGig, MyGigs
        │   ├── freelancer/ FreelancerDashboard, MyProposals
        │   └── admin/    AdminDashboard, AdminUsers, AdminGigs
        ├── redux/        store + 4 slices (auth, gigs, chat, notifications)
        └── utils/        api.js (50+ API functions)
```

## ✅ All Features Implemented
- JWT Authentication + Google OAuth + Email Verification
- Two-Factor Authentication (2FA with QR code)
- Forgot/Reset Password
- 3 Roles: Client, Freelancer, Admin
- Gig Marketplace with filters, search, pagination
- Create Gig (3-step wizard with milestones)
- Proposal system with bidding & negotiation
- AI-powered job matching (Jaccard + weighted scoring)
- Real-time Chat (Socket.IO, typing indicators, read receipts)
- WebRTC video call signaling
- Razorpay payments with escrow system
- Milestone payments + payment release
- Weighted reputation scoring + fraud detection
- Review system with owner responses
- Freelancer analytics dashboard with charts (Recharts)
- Admin analytics dashboard
- Admin user management (suspend/verify)
- Admin gig approval
- Dispute resolution system
- Real-time notifications
- Cloudinary file uploads
- Rate limiting + security headers

## 📅 Review: April 8, 2026
