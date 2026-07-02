const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
// Assuming you have an authentication middleware to verify JWT
// The existing project seems to have auth routes but we need to check if a middleware exists.
// Based on typical MERN structure, we will assume a generic token verification.
// If not, we will need to create one. For now, let's mock the import.
// We will need to check the actual auth.js or middleware folder for the verifyToken function.

// For demonstration, let's create an inline middleware if none exists, 
// but it's better to use the central one. 
// Assuming central middleware might be in a 'middleware' folder.
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json('Token is not valid!');
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json('You are not authenticated!');
    }
};

// Route: Create Order
router.post('/create-order', verifyToken, paymentController.createOrder);

// Route: Verify Payment Signature
router.post('/verify', verifyToken, paymentController.verifyPayment);

// Route: Get Payment History for current user
router.get('/history', verifyToken, paymentController.getPaymentHistory);

module.exports = router;
