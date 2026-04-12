# SkillSphere — Complete Render Deployment Guide

## What We're Deploying
- **Backend** → Render Web Service (Node.js)
- **Frontend** → Render Static Site (React)
- **Database** → MongoDB Atlas (free)

---

## STEP 1: Set Up MongoDB Atlas (Database)

1. Go to **https://cloud.mongodb.com** → Create free account
2. Click **"Build a Database"** → Choose **M0 Free** tier
3. **Database Access** → Add New User → set username + password (save these!)
4. **Network Access** → Add IP Address → type `0.0.0.0/0` → Confirm
5. **Clusters** → Connect → Drivers → Copy your connection string:
   ```
   mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/skillsphere
   ```
   Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with what you set in step 3.

---

## STEP 2: Deploy the Backend

### 2.1 — Check your backend/package.json

Make sure it has a `start` script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 2.2 — Fix server.js PORT

Make sure your `backend/server.js` uses the environment PORT:
```js
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 2.3 — Fix CORS in server.js

```js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});
```

### 2.4 — Render Settings for Backend

Go to **https://render.com** → New → **Web Service**

| Field | Value |
|---|---|
| Name | `skillsphere-backend` |
| Language | `Node` |
| Branch | `main` |
| Region | `Singapore` |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

### 2.5 — Add Environment Variables for Backend

In Render → your service → **Environment** tab → Add these one by one:

```
NODE_ENV             = production
PORT                 = 10000
MONGO_URI            = mongodb+srv://user:pass@cluster.mongodb.net/skillsphere
JWT_SECRET           = any_random_strong_string_minimum_32_characters
SESSION_SECRET       = another_random_string_for_sessions

FRONTEND_URL         = https://skillsphere-frontend.onrender.com

GITHUB_CLIENT_ID     = (from github.com/settings/developers)
GITHUB_CLIENT_SECRET = (from github.com/settings/developers)
GITHUB_CALLBACK_URL  = https://skillsphere-backend.onrender.com/api/auth/github/callback

GOOGLE_CLIENT_ID     = (from console.cloud.google.com)
GOOGLE_CLIENT_SECRET = (from console.cloud.google.com)
GOOGLE_CALLBACK_URL  = https://skillsphere-backend.onrender.com/api/auth/google/callback

RAZORPAY_KEY_ID      = rzp_test_your_key
RAZORPAY_KEY_SECRET  = your_razorpay_secret
```

Click **"Save Changes"** → Render will auto-deploy.

Wait for the green **"Live"** status. Copy your backend URL:
```
https://skillsphere-backend.onrender.com
```

---

## STEP 3: Deploy the Frontend

### 3.1 — Create the _redirects file

Create file at `frontend/public/_redirects` with this content:
```
/*  /index.html  200
```
This prevents 404 errors when users refresh or directly visit a URL.

### 3.2 — Create frontend/.env.production

Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://skillsphere-backend.onrender.com
```

### 3.3 — Commit and push these new files to GitHub

```bash
git add .
git commit -m "add production env and redirects"
git push origin main
```

### 3.4 — Render Settings for Frontend

Go to **https://render.com** → New → **Static Site**

| Field | Value |
|---|---|
| Name | `skillsphere-frontend` |
| Branch | `main` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `build` |

### 3.5 — Add Environment Variables for Frontend

```
REACT_APP_API_URL = https://skillsphere-backend.onrender.com
```

Click **"Create Static Site"** → Wait for deploy → Copy your frontend URL:
```
https://skillsphere-frontend.onrender.com
```

---

## STEP 4: Update OAuth Callback URLs

Now that you have the real URLs, update them in:

### GitHub OAuth App:
1. Go to **github.com/settings/developers** → OAuth Apps → SkillSphere
2. Change **Authorization callback URL** to:
   ```
   https://skillsphere-backend.onrender.com/api/auth/github/callback
   ```

### Google OAuth:
1. Go to **console.cloud.google.com** → Credentials → Your OAuth 2.0 Client
2. Under **Authorized redirect URIs** → Add:
   ```
   https://skillsphere-backend.onrender.com/api/auth/google/callback
   ```

---

## STEP 5: Update FRONTEND_URL in Backend

Go back to Render → skillsphere-backend → Environment → Update:
```
FRONTEND_URL = https://skillsphere-frontend.onrender.com
```
This triggers a redeploy automatically.

---

## STEP 6: Test Your Deployment

Test backend is running:
```
https://skillsphere-backend.onrender.com/api/auth/me
```
You should see `401 Unauthorized` — this means the server is running correctly.

Test frontend:
```
https://skillsphere-frontend.onrender.com
```
Your SkillSphere app should load.

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| Build fails with "Cannot find module" | Root Directory wrong | Set Root Directory to `backend` or `frontend` |
| App crashes: EADDRINUSE | Hardcoded port | Use `process.env.PORT \|\| 5000` in server.js |
| MongoDB connection timeout | IP not whitelisted | Add `0.0.0.0/0` in MongoDB Atlas Network Access |
| CORS error in browser | FRONTEND_URL wrong | Set correct frontend URL in backend env vars |
| 404 on page refresh | Missing _redirects | Add `frontend/public/_redirects` with `/* /index.html 200` |
| OAuth callback error | Wrong callback URL | Update callback URL in GitHub/Google with production URL |
| Socket.IO not connecting | Wrong API URL | Check REACT_APP_API_URL is set correctly in frontend |
| Slow first load (30s) | Free tier cold start | Normal on free tier — use UptimeRobot to keep it warm |

---

## Keep Your Backend Awake (Free Tier Fix)

Render free tier puts your backend to sleep after 15 minutes of no traffic.
Fix: Use **UptimeRobot** (free) to ping it every 10 minutes.

1. Go to **https://uptimerobot.com** → Create free account
2. Add New Monitor:
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `SkillSphere Backend`
   - URL: `https://skillsphere-backend.onrender.com/api/auth/me`
   - Monitoring Interval: `10 minutes`
3. Save → Done! Your backend stays awake 24/7.

---

## Deployment Order Summary

```
1. MongoDB Atlas   → Create cluster, get connection string
2. Backend         → Deploy on Render, add all env vars
3. Get backend URL → https://skillsphere-backend.onrender.com
4. Frontend        → Add _redirects file, create .env.production
5. Frontend        → Deploy on Render, add REACT_APP_API_URL
6. Get frontend URL→ https://skillsphere-frontend.onrender.com
7. Update OAuth    → Update callback URLs in GitHub and Google
8. Update backend  → Set correct FRONTEND_URL
9. Test everything → Login, GitHub OAuth, API calls
```

---

## Your Final Live URLs

```
Frontend:  https://skillsphere-frontend.onrender.com
Backend:   https://skillsphere-backend.onrender.com
Database:  MongoDB Atlas (cloud.mongodb.com)
```