# Deployment Troubleshooting Guide

## 🔍 Common Issues & Solutions

### 1. Backend Won't Deploy on Render

**Error**: "Build failed" or "Deploy failed"

**Check list**:
```
1. Go to Render Dashboard → Your Backend Service → Logs tab
2. Look for error messages
3. Common causes:
   - Missing dependencies: Run `npm install` locally first
   - Syntax error in code: Check server.js compiles (node server.js)
   - Wrong Node version: Check package.json engines.node = "18.x"
4. Solution: Fix error, push to GitHub, Render redeploys automatically
```

**If still failing**:
- Delete service and create new one
- Or manually run: `git push origin main`

---

### 2. "Cannot GET /" (404 Error on Backend)

**Problem**: Hitting `https://rideshare-backend.onrender.com/` returns 404

**Solution**: Make sure backend has health check endpoint (✓ Already added)
```javascript
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running', status: 'healthy' });
});
```

**Test**: `curl https://rideshare-backend.onrender.com/`
Should return JSON response.

---

### 3. MongoDB Connection Error

**Error**: "MongoError: connection refused" or "Invalid connection string"

**Solutions**:

#### a) Verify Connection String Format
```
mongodb+srv://capstone_user:PASSWORD@cluster0.xxxxx.mongodb.net/driver_tracking?retryWrites=true&w=majority
```

Common mistakes:
- ❌ `PASSWORD` not replaced with actual password
- ❌ `@` symbol in password not URL-encoded
- ❌ Wrong database name after `/`
- ❌ Missing query parameters

#### b) Check MongoDB Atlas Settings
1. Go to MongoDB Atlas Dashboard
2. **Network Access** → Make sure IP is whitelisted (Add 0.0.0.0/0 for anywhere)
3. **Database Access** → Check user exists and password is correct
4. **Clusters** → Make sure cluster is running (not paused)

#### c) Test Connection Locally
```bash
cd backend
npm install
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected!')).catch(e => console.log('Error:', e.message))"
```

---

### 4. CORS Errors (Frontend Can't Call Backend)

**Error in Browser Console**: 
```
Access to XMLHttpRequest blocked by CORS policy
```

**Causes**:
- Backend CORS not configured for frontend URL
- Typo in FRONTEND_URL environment variable

**Solution**:

1. Go to Render Dashboard → Backend Service → Environment
2. Check `FRONTEND_URL` matches exactly:
   ```
   https://rideshare-frontend.vercel.app
   (No trailing slash, must be https://)
   ```
3. Check server.js uses this variable:
   ```javascript
   origin: process.env.FRONTEND_URL || "http://localhost:3000"
   ```
4. Redeploy backend (or wait for auto-deploy)

---

### 5. Socket.io Connection Fails

**Error**: "WebSocket is closed" or socket events not working

**Problem**: Real-time features not connecting

**Solutions**:

#### a) Check Frontend Configuration
```javascript
// In your API client or main.jsx
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);
```

#### b) Check Environment Variables
On Vercel Dashboard → Your Frontend Project:
- `VITE_API_BASE_URL=https://rideshare-backend.onrender.com`
- `VITE_SOCKET_URL=https://rideshare-backend.onrender.com`

#### c) Test Connection
Browser console:
```javascript
// Should show connection attempts and Socket.io messages
io('https://rideshare-backend.onrender.com')
```

#### d) Check Render Backend Logs
Look for: `"A user connected: socket_id"`

---

### 6. Frontend Shows Blank Page or 404

**Problem**: Vercel deployed but page is blank

**Solutions**:

#### a) Check Build Settings
1. Vercel Dashboard → Your Frontend → Settings
2. **Build & Development Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend` (if monorepo)

#### b) Check Environment Variables in Vercel
1. Go to Environment tab
2. Make sure variables are set before deployment
3. If added after, redeploy: **Deployments tab → ... menu → Redeploy**

#### c) Check Build Logs
1. **Deployments** tab → Failed deployment → View logs
2. Look for build errors
3. Common issues:
   - Missing imports: Check `src/main.jsx` imports
   - Missing dependencies: Check `package.json`
   - TypeScript errors: If using TypeScript

#### d) Test Locally
```bash
cd frontend
npm install
npm run build
npm run preview
```

---

### 7. Payment (Razorpay) Not Working

**Problem**: Payment button doesn't work or shows errors

**Solutions**:

#### a) Check Razorpay Keys
1. Backend environment has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
2. For testing: Use keys starting with `rzp_test_`
3. For production: Use keys starting with `rzp_live_`

#### b) Test Razorpay Credentials
```bash
# Check backend environment variables
curl https://rideshare-backend.onrender.com/api/payment/create-order \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}'
```

#### c) Use Test Card
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

---

### 8. "502 Bad Gateway" on Backend

**Problem**: Backend returns 502 error

**Causes**:
- Backend is still starting (takes 30-60 seconds on Render free tier)
- Node process crashed
- Infinite loop in code

**Solution**:
1. Wait 1 minute and refresh
2. Check Render logs for crash
3. If problem persists:
   - Go to Render Dashboard
   - Click **Manual Deploy**
   - Or check code for infinite loops

---

### 9. Ride Request Not Showing in Real-Time

**Problem**: Driver doesn't see ride request immediately

**Debug Steps**:

#### a) Check Socket.io Connection
1. Open driver page → Browser console
2. Should see: `Socket connected` or similar message
3. If not: Check VITE_SOCKET_URL configuration

#### b) Check Backend Logs
Render Dashboard → Backend → Logs
Look for: `Driver {id} registered with socket {socketId}`

#### c) Test Socket Events Manually
```javascript
// In browser console on driver page
socket.emit('registerDriver', { driverId: 'test-driver-123' });
// Should see console.log: "Driver test-driver-123 registered"
```

---

### 10. Frontend API Calls Return 404

**Problem**: Frontend can't find API endpoints

**Solutions**:

#### a) Check API Base URL
```javascript
// In API client file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

#### b) Verify Endpoint Exists on Backend
```bash
# Should work if backend is running
curl https://rideshare-backend.onrender.com/api/auth/login
# Should return error about missing body, not 404
```

#### c) Check Routes in Backend
Verify routes exist:
- `backend/routes/auth.js` → `/api/auth/*`
- `backend/routes/rides.js` → `/api/rides/*`
- `backend/routes/payment.js` → `/api/payment/*`

---

## 🔧 General Debugging Process

### Step 1: Identify Where Problem Occurs
- Is it on frontend? (Browser console F12)
- Is it on backend? (Render logs)
- Is it database? (MongoDB Atlas logs)
- Is it deployment? (GitHub/Vercel/Render)

### Step 2: Check Logs
```
Vercel: Deployments → Click deployment → View logs
Render: Dashboard → Service → Logs tab
MongoDB: Atlas → Clusters → Logs
GitHub: Actions tab (if CI/CD enabled)
```

### Step 3: Test Locally First
```bash
# Backend
cd backend
npm install
node server.js

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### Step 4: Check Environment Variables
Make sure ALL variables are set correctly:
```bash
# View current variables (be careful with secrets!)
echo $MONGO_URI
```

### Step 5: Isolate the Issue
- Is API working? Test with curl
- Is Socket.io working? Check browser console
- Is database working? Check MongoDB Atlas
- Is frontend rendering? Check for JavaScript errors

---

## 🆘 Emergency Fixes

### Quick Redeploy (if something broke)
```bash
# Push changes to trigger redeployment
git add .
git commit -m "Fix: deployment issue"
git push origin main

# Automatic redeploy on Render (if enabled)
# Automatic redeploy on Vercel (always enabled)
```

### Reset Environment Variables
1. Go to Render/Vercel Dashboard
2. Remove variable
3. Re-add with correct value
4. Manual redeploy

### Clear Browser Cache
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
// Refresh page Ctrl+Shift+R
```

### Restart Services
- **Render**: Dashboard → Service → Settings → Scroll down → **Restart Instance**
- **Vercel**: **Deployments** → **... menu** → **Redeploy**
- **MongoDB**: Automatic (cloud service)

---

## 📞 Getting Help

### Check These First:
1. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Main deployment steps
2. [ENV_VARIABLES.md](ENV_VARIABLES.md) - Environment variable reference
3. Official Documentation:
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs
   - MongoDB: https://docs.mongodb.com
   - Socket.io: https://socket.io/docs/

### Common Documentation:
- Express.js CORS: https://expressjs.com/en/resources/middleware/cors.html
- Mongoose: https://mongoosejs.com/docs/
- Razorpay Node SDK: https://github.com/razorpay/razorpay-node

---

**Still stuck?** Try this:
1. Check all three locations (Browser console, Render logs, MongoDB Atlas)
2. Compare your setup with DEPLOYMENT_GUIDE.md
3. Look for typos in environment variables
4. Try local testing first
5. Check GitHub issues in official repos

Good luck! 🚀
