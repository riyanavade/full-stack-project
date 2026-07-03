# 🚀 Complete Deployment Guide: GitHub, Vercel, Render & MongoDB Atlas

This guide provides step-by-step instructions to deploy your ridesharing application.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare GitHub Repository](#step-1-prepare-github-repository)
3. [Step 2: Setup MongoDB Atlas](#step-2-setup-mongodb-atlas)
4. [Step 3: Deploy Backend to Render](#step-3-deploy-backend-to-render)
5. [Step 4: Deploy Frontend to Vercel](#step-4-deploy-frontend-to-vercel)
6. [Step 5: Configure Environment Variables](#step-5-configure-environment-variables)
7. [Step 6: Testing & Verification](#step-6-testing--verification)

---

## ✅ Prerequisites

Before starting, ensure you have:
- **GitHub Account** - [github.com](https://github.com)
- **Vercel Account** - [vercel.com](https://vercel.com) (signup with GitHub)
- **Render Account** - [render.com](https://render.com) (signup with GitHub)
- **MongoDB Atlas Account** - [mongodb.com/cloud](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Razorpay Account** - For payment processing
- **Git installed** on your computer

---

## 📝 Step 1: Prepare GitHub Repository

### 1.1 Initialize Git (if not already done)
```bash
cd "d:\full stack\capstone project\capstone project (2)\capstone project"
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 1.2 Create .gitignore files (Already created! ✓)
- Backend: `.gitignore` ✓
- Frontend: `.gitignore` ✓

### 1.3 Create .env.example files (Already created! ✓)
- Backend: `.env.example` ✓
- Frontend: `.env.example` ✓

### 1.4 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository Name**: `rideshare-capstone` (or your preferred name)
3. **Description**: "Full-stack ridesharing application with real-time tracking"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (we'll add it)
6. Click **Create repository**

### 1.5 Add Remote and Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/rideshare-capstone.git
git add .
git commit -m "Initial commit: Capstone project setup for deployment"
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2: Setup MongoDB Atlas (Cloud Database)

### 2.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Sign Up**
3. Register with email or use Google/GitHub
4. Verify email

### 2.2 Create a Cluster
1. Click **Create** under Project
2. Select **Free** tier (M0)
3. Choose **Cloud Provider**: AWS
4. Choose **Region**: Select closest to your users (e.g., us-east-1)
5. Click **Create Cluster** (wait 2-3 minutes)

### 2.3 Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. **Username**: `capstone_user`
4. **Password**: Generate strong password (Save this!)
5. **Database User Privileges**: Built-in Role → **Atlas Admin**
6. Click **Add User**

### 2.4 Get Connection String
1. Go to **Clusters** → Click **Connect**
2. Select **Drivers** → **Node.js** → **Version: 5.1 or later**
3. Copy the connection string:
   ```
   mongodb+srv://capstone_user:<password>@cluster0.xxxxx.mongodb.net/driver_tracking?retryWrites=true&w=majority
   ```
4. Replace `<password>` with actual password
5. Replace `driver_tracking` with your database name (keep it as is)

### 2.5 Whitelist IP Address
1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (or add Render's IP if you know it)
4. Confirm

**Save your Connection String!** You'll need it later.

---

## 🔧 Step 3: Deploy Backend to Render

### 3.1 Prepare Backend for Deployment

Update [backend/server.js](backend/server.js) - Add production readiness:

```javascript
// At the very top of server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Production-ready CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200
};

const io = new Server(server, {
    cors: corsOptions
});

app.set('io', io);
app.use(cors(corsOptions));
app.use(express.json());

// Routes...
// (keep existing routes as is)

// Health check endpoint (important for Render)
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 3.2 Add Start Script to Backend

Your `package.json` already has this ✓
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### 3.3 Create Render Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. **Service Name**: `rideshare-backend`
5. **Environment**: `Node`
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`
8. **Plan**: Free (or Paid if you need more resources)
9. Click **Create Web Service**

### 3.4 Add Environment Variables in Render

In the Render dashboard for your backend service:

1. Go to **Environment** tab
2. Add these variables:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://capstone_user:password@cluster0...` |
| `JWT_SECRET` | Generate random: `openssl rand -hex 32` |
| `RAZORPAY_KEY_ID` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
| `FRONTEND_URL` | `https://your-frontend-vercel-url.vercel.app` |

3. **Important**: Backend needs time to deploy. Go back to **Settings** and set:
   - **Auto-Deploy**: On

**After deployment, copy the URL** (e.g., `https://rideshare-backend.onrender.com`)

---

## 🎨 Step 4: Deploy Frontend to Vercel

### 4.1 Create `.env.local` for Frontend (Production)

Create file: [frontend/.env.local](frontend/.env.local)
```env
VITE_API_BASE_URL=https://rideshare-backend.onrender.com
VITE_SOCKET_URL=https://rideshare-backend.onrender.com
```

### 4.2 Update Frontend API Client

Check [frontend/src/main.jsx](frontend/src/main.jsx) and make sure it uses:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
```

### 4.3 Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
cd frontend
npm install -g vercel
vercel
```
- Login with GitHub
- Follow prompts
- Select project settings when asked

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. **Project Name**: `rideshare-frontend`
5. **Framework**: Vite
6. **Root Directory**: `frontend`
7. **Build Command**: `npm run build`
8. **Output Directory**: `dist`
9. Click **Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://rideshare-backend.onrender.com`
   - `VITE_SOCKET_URL` = `https://rideshare-backend.onrender.com`
10. Click **Deploy**

**After deployment, copy the Vercel URL** (e.g., `https://rideshare-frontend.vercel.app`)

---

## ⚙️ Step 5: Configure Environment Variables

### 5.1 Update Backend with Frontend URL

1. Go to **Render Dashboard** → Your Backend Service
2. Go to **Environment**
3. Update `FRONTEND_URL` to your Vercel URL
4. The backend will auto-redeploy

### 5.2 Verify Environment Variables

**Backend (.env on Render)**:
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://capstone_user:password@cluster0...
JWT_SECRET=random_hex_string
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
FRONTEND_URL=https://rideshare-frontend.vercel.app
```

**Frontend (.env.local on Vercel)**:
```
VITE_API_BASE_URL=https://rideshare-backend.onrender.com
VITE_SOCKET_URL=https://rideshare-backend.onrender.com
```

---

## ✅ Step 6: Testing & Verification

### 6.1 Test Backend API
```bash
curl https://rideshare-backend.onrender.com/
# Should return: { "message": "Backend server is running" }
```

### 6.2 Test Frontend
1. Open your Vercel URL in browser
2. Check Browser Console (F12) for errors
3. Network tab should show API calls to Render backend

### 6.3 Test Real-Time Features
1. Open Driver Dashboard
2. Open Passenger Dashboard (in another tab)
3. Request a ride
4. Driver should receive request in real-time via Socket.io

### 6.4 Test Payment (Razorpay)
- Use Razorpay test card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't connect to MongoDB | Check MONGO_URI is correct, IP is whitelisted in MongoDB Atlas |
| CORS errors on frontend | Update FRONTEND_URL in backend environment variables |
| Socket.io connection fails | Ensure VITE_SOCKET_URL matches backend URL with https:// |
| "Cannot find module" errors | Run `npm install` in both frontend and backend |
| Build fails on Vercel | Check `package.json` has all dependencies, remove `^` version pins |
| 502 Bad Gateway on Render | Backend service is starting, wait 30 seconds and refresh |

---

## 📱 Production Checklist

- [ ] GitHub repository created and code pushed
- [ ] MongoDB Atlas cluster set up with database user
- [ ] Backend deployed to Render with all environment variables
- [ ] Frontend deployed to Vercel with API URLs configured
- [ ] CORS properly configured between services
- [ ] Razorpay keys configured for production
- [ ] Frontend and Backend can communicate
- [ ] Socket.io real-time features working
- [ ] Database persisting data
- [ ] All authentication flows tested
- [ ] Payment processing tested

---

## 🚀 Next Steps

1. **Monitor logs** on Render and Vercel dashboards
2. **Enable auto-deploy** for both services
3. **Set up error tracking** (Sentry, LogRocket)
4. **Configure custom domain** (optional)
5. **Setup CI/CD pipelines** for automated testing

---

## 📞 Support

For deployment help:
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com

---

**You're all set! Your ridesharing app is now live! 🎉**
