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
    cors: corsOptions,
    transports: ['websocket', 'polling'] // Enable both for better compatibility
});
app.set('io', io);

app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint (important for monitoring and deployment)
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend server is running',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});


// Socket.io for Real-time location tracking
const Driver = require('./models/Driver');

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Driver joins their own room for targeted communication
    socket.on('registerDriver', async (data) => {
        const { driverId } = data;
        if (driverId) {
            socket.join(`driver_${driverId}`);
            console.log(`Driver ${driverId} registered with socket ${socket.id}`);
            // Update driver's socket ID in database — upsert so profile auto-creates
            try {
                await Driver.findOneAndUpdate(
                    { userId: driverId },
                    { 
                        socketId: socket.id, 
                        isAvailable: true,
                        $setOnInsert: { vehicleDetails: 'Not specified' }
                    },
                    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
                );
                
                // Check if there is a recent pending booking (last 10 min) and notify the driver
                const Booking = require('./models/Booking');
                const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
                const pendingBooking = await Booking.findOne({
                    driverId: { $exists: false },
                    status: 'pending',
                    createdAt: { $gte: tenMinutesAgo }
                }).sort({ createdAt: -1 });
                if (pendingBooking) {
                    socket.emit('rideRequest', pendingBooking);
                    console.log(`Sent recent pending booking ${pendingBooking._id} to driver ${driverId}`);
                }
            } catch (err) {
                console.log('Error updating driver socket:', err.message);
            }
        }
    });

    // Passenger joins a booking room to receive updates
    socket.on('joinRide', (data) => {
        const { bookingId } = data;
        if (bookingId) {
            socket.join(`ride_${bookingId}`);
            console.log(`Socket ${socket.id} joined ride room: ride_${bookingId}`);
        }
    });

    // Driver sends location update — emit to the specific booking room
    socket.on('driverLocationUpdate', async (data) => {
        const { bookingId, lat, lng, driverId } = data;
        
        // Persist driver location to MongoDB
        if (driverId) {
            try {
                await Driver.findOneAndUpdate(
                    { userId: driverId },
                    {
                        location: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        lastLocationUpdate: new Date()
                    }
                );
            } catch (err) {
                console.log('Error persisting driver location:', err.message);
            }
        }

        // Emit to the specific booking room if bookingId provided, otherwise broadcast
        if (bookingId) {
            io.to(`ride_${bookingId}`).emit('locationUpdate', { lat, lng });
        } else {
            io.emit('locationUpdate', { lat, lng });
        }
    });

    // Driver goes offline
    socket.on('driverOffline', async (data) => {
        const driverId = data?.driverId;
        if (driverId) {
            try {
                await Driver.findOneAndUpdate(
                    { userId: driverId },
                    { isAvailable: false, socketId: null }
                );
                console.log(`Driver ${driverId} went offline`);
            } catch (err) {
                console.log('Error updating driver status:', err.message);
            }
        } else {
            // fallback: mark driver offline by socket ID
            try {
                await Driver.findOneAndUpdate(
                    { socketId: socket.id },
                    { isAvailable: false, socketId: null }
                );
            } catch (err) {
                console.log('Error updating driver status by socketId:', err.message);
            }
        }
    });

    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        // Mark driver as offline if they disconnect
        try {
            await Driver.findOneAndUpdate(
                { socketId: socket.id },
                { isAvailable: false, socketId: null }
            );
        } catch (err) {
            console.log('Error on disconnect cleanup:', err.message);
        }
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
