# Environment Variables Reference

## 🔑 Complete List of Environment Variables

### Backend Environment Variables (Set in Render Dashboard)

| Variable | Example Value | Where to Get | Description |
|----------|---------------|-------------|-------------|
| `PORT` | `5000` | Default | Port server listens on |
| `NODE_ENV` | `production` | Set explicitly | Node environment |
| `MONGO_URI` | `mongodb+srv://capstone_user:password@cluster0.xxxxx.mongodb.net/driver_tracking?retryWrites=true&w=majority` | MongoDB Atlas | MongoDB connection string |
| `JWT_SECRET` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` | Generate: `openssl rand -hex 32` | Secret for JWT tokens |
| `RAZORPAY_KEY_ID` | `rzp_live_1234567890` | Razorpay Dashboard → API Keys | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | `abc123def456ghi789` | Razorpay Dashboard → API Keys | Razorpay secret key |
| `FRONTEND_URL` | `https://rideshare-frontend.vercel.app` | After frontend deployment | Frontend URL for CORS |

### Frontend Environment Variables (Set in Vercel Dashboard)

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `VITE_API_BASE_URL` | `https://rideshare-backend.onrender.com` | Backend API endpoint |
| `VITE_SOCKET_URL` | `https://rideshare-backend.onrender.com` | WebSocket/Socket.io endpoint |

---

## 🛠️ How to Get Each Secret

### 1. Generate JWT_SECRET
```bash
# On Windows PowerShell
[Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))

# On Mac/Linux Terminal
openssl rand -hex 32
```

### 2. Get MongoDB Connection String
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click your cluster → **Connect** → **Drivers**
3. Choose Node.js → Copy connection string
4. **Important**: Replace `<password>` with your database user password

Example:
```
mongodb+srv://capstone_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/driver_tracking?retryWrites=true&w=majority
```

### 3. Get Razorpay Keys
1. Go to [razorpay.com/dashboard](https://razorpay.com/dashboard)
2. Click **Settings** → **API Keys**
3. Copy **Key ID** and **Key Secret**
4. For testing: Use test keys (they start with `rzp_test_`)
5. For production: Use live keys (they start with `rzp_live_`)

---

## 📦 Local Development (.env file)

Create `.env` file in `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/driver_tracking
JWT_SECRET=super_secret_jwt_key_123_for_testing_only
RAZORPAY_KEY_ID=rzp_test_T8v8LYsCenEozr
RAZORPAY_KEY_SECRET=1qGtbjPvED6d5rpQ47lWVRFh
FRONTEND_URL=http://localhost:3000
```

Create `.env.local` file in `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔐 Security Best Practices

⚠️ **NEVER commit `.env` files to GitHub!**

✅ **DO:**
- Store secrets in `.env` (local only)
- Add `.env` to `.gitignore` ✓ (already done)
- Use `.env.example` to show what variables are needed
- Commit `.env.example` with placeholder values
- Use strong, random values for JWT_SECRET
- Use Razorpay test keys during development
- Rotate secrets regularly in production

---

## 🚨 Common Issues

### "MONGO_URI is undefined"
**Solution**: Check that `MONGO_URI` is added in Render environment variables

### "Cannot connect to MongoDB"
**Solution**: 
1. Verify connection string is correct
2. Check IP whitelist in MongoDB Atlas (Network Access)
3. Verify database user password is correct (don't use special chars in wrong place)

### "CORS error when frontend calls backend"
**Solution**: 
1. Set `FRONTEND_URL` in backend environment
2. Make sure URL includes `https://` 
3. Wait 30 seconds for backend to redeploy

### "Socket.io connection timeout"
**Solution**:
1. Check `VITE_SOCKET_URL` in frontend
2. Make sure it matches backend URL
3. Check backend is running: `curl https://rideshare-backend.onrender.com/`

---

## ✅ Verification Steps

### 1. Test Backend is Running
```bash
curl https://rideshare-backend.onrender.com/
# Response should be: { "message": "Backend server is running", "status": "healthy" }
```

### 2. Test MongoDB Connection
Check Render logs:
```
MongoDB connected
```

### 3. Test API Endpoint
```bash
curl https://rideshare-backend.onrender.com/api/auth/signup \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 4. Test Frontend Environment Variables
In browser console (F12):
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
console.log(import.meta.env.VITE_SOCKET_URL)
```

---

## 📝 Environment Variables Summary

**Minimum required for production:**
- Backend: 7 variables
- Frontend: 2 variables
- Total: 9 variables to configure

**Time to set up:** ~15 minutes

---

For help, refer to the main [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
