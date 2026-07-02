const express = require('express');
const router = express.Router();
const adminPaymentController = require('../controllers/adminPaymentController');

// Assume verifyAdmin middleware exists, but for now we'll just mock it or skip it as requested in requirements
// The requirement says "Protect Admin Routes". We will add a mock verifyAdmin middleware.
const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json('Token is not valid!');
            if (user.role !== 'admin') return res.status(403).json('Admin access required!');
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json('You are not authenticated!');
    }
};

// Mock data for admin dashboard stats
router.get('/stats', (req, res) => {
    // In a real app, this would query the DB models (User.countDocuments, Driver.countDocuments, Booking.countDocuments)
    res.json({
        totalUsers: 145,
        activeDrivers: 24,
        totalBookings: 890,
        revenue: '$12,450',
        recentRides: [
            { id: '1', passenger: 'Alice Smith', status: 'completed', fare: '$15.50', date: '2026-06-30' },
            { id: '2', passenger: 'Bob Johnson', status: 'in-progress', fare: '$22.00', date: '2026-06-30' },
            { id: '3', passenger: 'Charlie Brown', status: 'pending', fare: '$8.00', date: '2026-06-30' }
        ]
    });
});

// Admin Payment Routes
router.get('/payments', verifyAdmin, adminPaymentController.getAllPayments);
router.put('/payment/:id/approve', verifyAdmin, adminPaymentController.approvePayment);
router.put('/payment/:id/reject', verifyAdmin, adminPaymentController.rejectPayment);

module.exports = router;
