# Deployment Architecture & Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION DEPLOYMENT                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                                │
│              (React App - Vercel Deployment)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ https://rideshare-frontend.vercel.app                        │   │
│  │                                                              │   │
│  │  • Login/Signup Pages                                        │   │
│  │  • Driver/Passenger Dashboards                              │   │
│  │  • Real-time Location Tracking (via Socket.io)             │   │
│  │  • Payment Integration (Razorpay)                          │   │
│  │  • Redux State Management                                   │   │
│  │  • Leaflet Maps Component                                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS Requests
                              │ WebSocket (Socket.io)
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         RENDER (Backend)                              │
│              (Node.js/Express - Render Deployment)                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ https://rideshare-backend.onrender.com                      │   │
│  │                                                              │   │
│  │  API Routes:                                                 │   │
│  │  • /api/auth (Login, Signup, JWT)                          │   │
│  │  • /api/rides (Booking, Location Updates)                  │   │
│  │  • /api/payment (Razorpay Integration)                     │   │
│  │  • /api/admin (Admin Dashboard)                            │   │
│  │                                                              │   │
│  │  WebSocket Events:                                          │   │
│  │  • registerDriver → Real-time availability                 │   │
│  │  • driverLocationUpdate → Live tracking                    │   │
│  │  • rideRequest → Notifications                             │   │
│  │  • joinRide → Subscribe to ride updates                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Queries
                              │ Real-time Events
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS (Database)                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ mongodb+srv://capstone_user:***@cluster0.xxxxx.mongodb.net  │   │
│  │                                                              │   │
│  │ Collections:                                                 │   │
│  │ • Users (Passengers & Auth Info)                           │   │
│  │ • Drivers (Driver Profiles & Real-time Location)           │   │
│  │ • Bookings (Ride Requests & Status)                        │   │
│  │ • Payments (Transaction History)                           │   │
│  │                                                              │   │
│  │ Indexes:                                                     │   │
│  │ • userId, email, driverId, bookingId (for queries)         │   │
│  │ • Geospatial index on driver location (for nearby drivers) │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘


                    ┌─────────────────────────┐
                    │   External Services     │
                    ├─────────────────────────┤
                    │ • Razorpay (Payment)   │
                    │ • Leaflet (Maps)       │
                    │ • SendGrid (Email)     │
                    └─────────────────────────┘
```

---

## 📊 Deployment Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                    CONTINUOUS DEPLOYMENT FLOW                        │
└──────────────────────────────────────────────────────────────────────┘

LOCAL MACHINE
    │
    ├─→ Edit code (Frontend/Backend)
    │
    ├─→ git add .
    │
    ├─→ git commit -m "message"
    │
    └─→ git push origin main
              │
              ▼
         ┌─────────────────────────┐
         │  GITHUB REPOSITORY      │
         │  (Main Branch)          │
         └────────────┬────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
    ┌─────────────────────┐   ┌──────────────────────┐
    │ RENDER WEBHOOK      │   │ VERCEL WEBHOOK       │
    │ (Backend Auto-Build)│   │ (Frontend Auto-Build)│
    └────────────┬────────┘   └──────────────┬───────┘
                 │                           │
                 ▼                           ▼
        ┌──────────────────┐      ┌────────────────────┐
        │ Install deps     │      │ Install deps       │
        │ Run build        │      │ Run: npm run build │
        │ Deploy service   │      │ Deploy to Vercel   │
        │ Update URL       │      │ Update URL         │
        └────────────┬─────┘      └────────────┬───────┘
                     │                         │
                     ▼                         ▼
        ┌──────────────────┐      ┌────────────────────┐
        │ RENDER.COM       │      │ VERCEL.COM         │
        │ ✓ Running        │      │ ✓ Live             │
        │ https://backend  │      │ https://frontend   │
        └────────────┬─────┘      └────────────┬───────┘
                     │                         │
                     └────────────┬────────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   LIVE USERS     │
                        │   Using App      │
                        └──────────────────┘
```

---

## 🔄 Data Flow During Runtime

```
USER REQUESTS A RIDE
│
├─→ [Frontend] Sends location to backend
│   (Passenger location: pickup)
│
├─→ [Backend] Receives request
│   1. Validates JWT token
│   2. Saves booking to MongoDB
│   3. Broadcasts to all online drivers via Socket.io
│
├─→ [Database] Stores booking record
│   Booking { passengerId, pickupLocation, status: 'pending' }
│
├─→ [Drivers] Receive notification via Socket.io
│   Event: 'rideRequest'
│
├─→ [Driver] Accepts ride
│
├─→ [Backend] Updates booking status
│   Status: 'accepted' + driverId
│
├─→ [Frontend] Shows driver details & real-time location
│
├─→ [Driver] Starts location tracking
│   Emits: 'driverLocationUpdate' every 5 seconds
│
├─→ [Backend] Updates driver location in MongoDB
│   Driver { userId, location: { lat, lng }, socketId }
│
├─→ [Frontend] Receives location via Socket.io
│   Updates map with driver location
│
├─→ [Passenger] Completes ride
│
├─→ [Backend] Updates booking status to 'completed'
│
├─→ [Payment] Initiates Razorpay payment
│   Amount: calculated fare
│
├─→ [Razorpay] Processes payment
│   Card validation, transaction processing
│
├─→ [Backend] Receives payment confirmation
│   Creates Payment record in MongoDB
│
└─→ [Frontend] Shows success message
    User can view payment history
```

---

## 🌍 Environment Configuration Map

```
                    DEVELOPMENT                    PRODUCTION
                    ───────────                     ──────────
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
├─────────────────────────────────────────────────────────────┤
│ Port              3000 (Local)                 Vercel (Auto) │
│ URL               localhost:3000               vercel.app    │
│ API Base URL      localhost:5000               render.com    │
│ Socket URL        localhost:5000               render.com    │
│ Build Tool        Vite Dev Server              Vercel Build  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
├─────────────────────────────────────────────────────────────┤
│ Port              5000 (Local)                 Render (Auto) │
│ Server            Node + Express               Render Web Sv │
│ Database          Local MongoDB                Atlas Cloud   │
│ Node Version      18.x                        18.x (set)     │
│ Auto-Deploy       N/A                         From GitHub    │
│ Health Check      http://localhost:5000       render.com/    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       Database                              │
├─────────────────────────────────────────────────────────────┤
│ Provider          Local mongod                 MongoDB Atlas │
│ Connection        mongodb://127.0.0.1:27017   mongodb+srv:// │
│ Database          driver_tracking              driver_tracking│
│ User Auth         No password                 capstone_user   │
│ Backup            Manual                      Automatic       │
│ Whitelist         N/A                         0.0.0.0/0       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability & Performance Considerations

```
┌────────────────────────────────────────────────────────────┐
│                  CURRENT SETUP (FREE TIER)                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Frontend (Vercel Free):                                 │
│  • Unlimited deployments                                 │
│  • Automatic scaling                                     │
│  • CDN in 30+ regions                                    │
│  ✓ Suitable for: 10K+ daily users                        │
│                                                            │
│  Backend (Render Free):                                  │
│  • 0.5 CPU, 512MB RAM                                    │
│  • Spins down after 15 min inactivity (cold start delay) │
│  ⚠ Suitable for: Development/Small pilot                  │
│  💡 Upgrade to: Starter Plan ($12/mo) for production      │
│                                                            │
│  Database (MongoDB Atlas Free):                          │
│  • Shared cluster, 512MB storage                         │
│  • Automatic backups (3 day retention)                   │
│  ✓ Suitable for: 100K+ documents                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│              SECURITY INFRASTRUCTURE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. HTTPS/SSL (Automatic)                               │
│    • Render: Automatic HTTPS                           │
│    • Vercel: Automatic HTTPS                           │
│    • MongoDB: Encrypted connection string               │
│                                                         │
│ 2. Authentication (JWT)                                │
│    • Token stored in httpOnly cookies                  │
│    • Verified on every API request                     │
│    • Secret kept in environment variables              │
│                                                         │
│ 3. Authorization                                        │
│    • Role-based access (User, Driver, Admin)           │
│    • Verified on backend                               │
│                                                         │
│ 4. Payment Security                                    │
│    • PCI-DSS compliant via Razorpay                    │
│    • Test keys for development                         │
│    • Live keys for production                          │
│                                                         │
│ 5. Database Security                                   │
│    • IP whitelisting in MongoDB Atlas                  │
│    • User authentication (capstone_user)               │
│    • Connection string not exposed                     │
│                                                         │
│ 6. Secrets Management                                  │
│    • Never commit .env files                           │
│    • Use environment variables on platforms            │
│    • Rotate secrets regularly                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Cost Breakdown (Monthly)

```
Vercel Frontend:        FREE ✓
Render Backend:         FREE (with limitations) or $12/mo
MongoDB Atlas:          FREE (512MB) or $57/mo (2GB)
Razorpay:              2.36% per transaction
Domain Name (optional):  ~$10-15/year

TOTAL:                  FREE (development)
                        or $12-72/month (production)
```

---

## ✅ Readiness Checklist

```
BEFORE DEPLOYING TO PRODUCTION:

Functionality:
  ☐ Login/Signup working
  ☐ Real-time location tracking working
  ☐ Ride booking flow tested
  ☐ Payment processing tested (test mode)
  ☐ Admin dashboard functional
  
Security:
  ☐ JWT secrets changed
  ☐ CORS properly configured
  ☐ .env not committed
  ☐ Razorpay using test keys (development)
  ☐ Database IP whitelisted
  
Performance:
  ☐ Frontend build optimized
  ☐ Database indexes created
  ☐ API response times acceptable
  ☐ No console errors in browser
  
Deployment:
  ☐ GitHub repository public
  ☐ All environment variables set
  ☐ Services connected via webhooks
  ☐ Auto-deploy enabled
  ☐ Health checks passing
  
Documentation:
  ☐ DEPLOYMENT_GUIDE.md reviewed
  ☐ Environment variables documented
  ☐ Team members notified
  ☐ Monitoring set up
```

---

Good luck with your deployment! 🚀
