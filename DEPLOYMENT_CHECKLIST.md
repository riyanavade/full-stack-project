# Quick Deployment Checklist

Copy and paste this to track your progress:

## 📋 Pre-Deployment (Local Setup)
- [ ] All code committed to GitHub (`git status` shows clean)
- [ ] `.gitignore` properly configured (not tracking `.env`)
- [ ] `.env.example` files created as reference
- [ ] Backend `package.json` has proper scripts
- [ ] Frontend `vite.config.js` configured
- [ ] No hardcoded API URLs (using environment variables)

## 🌐 GitHub Repository
- [ ] GitHub account created
- [ ] Repository created: `rideshare-capstone`
- [ ] Code pushed to GitHub (main branch)
- [ ] Repository is Public (for deployment integrations)

## 🗄️ MongoDB Atlas Setup
- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster created
- [ ] Database user created: `capstone_user`
- [ ] Password saved securely
- [ ] IP whitelist configured (Allow Access from Anywhere)
- [ ] Connection string copied and saved

## 🔧 Backend on Render
- [ ] Render account created (with GitHub login)
- [ ] New Web Service connected to GitHub repo
- [ ] Service name: `rideshare-backend`
- [ ] Environment variables added:
  - [ ] PORT = 5000
  - [ ] NODE_ENV = production
  - [ ] MONGO_URI = `mongodb+srv://...`
  - [ ] JWT_SECRET = (generated random string)
  - [ ] RAZORPAY_KEY_ID = (from Razorpay)
  - [ ] RAZORPAY_KEY_SECRET = (from Razorpay)
  - [ ] FRONTEND_URL = (will add after frontend deploy)
- [ ] Backend deployed successfully
- [ ] Backend URL copied: `https://rideshare-backend.onrender.com`

## 🎨 Frontend on Vercel
- [ ] Vercel account created (with GitHub login)
- [ ] New project created from GitHub repo
- [ ] Framework: Vite selected
- [ ] Root directory: `frontend` (if monorepo)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added:
  - [ ] VITE_API_BASE_URL = `https://rideshare-backend.onrender.com`
  - [ ] VITE_SOCKET_URL = `https://rideshare-backend.onrender.com`
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied: `https://rideshare-frontend.vercel.app`

## ⚙️ Configuration & Testing
- [ ] Backend environment variable `FRONTEND_URL` updated to Vercel URL
- [ ] Backend redeployed automatically (or manually triggered)
- [ ] Test backend health: `curl https://rideshare-backend.onrender.com/`
- [ ] Test frontend loads without errors
- [ ] Browser console checked for CORS or API errors
- [ ] Real-time features tested (Socket.io connections)
- [ ] Authentication tested (Login/Signup)
- [ ] Payment flow tested (Razorpay test mode)
- [ ] Database persistence verified

## 🚀 Post-Deployment
- [ ] Auto-deploy enabled on both Render and Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified (automatic on Render/Vercel)
- [ ] Monitoring/logs checked regularly
- [ ] Error handling tested
- [ ] Mobile responsiveness verified
- [ ] All features end-to-end tested

---

## 🎯 Final Status

**Frontend URL**: https://rideshare-frontend.vercel.app
**Backend URL**: https://rideshare-backend.onrender.com
**Database**: MongoDB Atlas
**Repository**: https://github.com/YOUR_USERNAME/rideshare-capstone

All systems: ✅ Operational
