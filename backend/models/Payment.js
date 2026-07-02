const mongoose = require('mongoose');

// Define the Payment schema mapping to MongoDB
const paymentSchema = new mongoose.Schema({
    // Reference to the User who made the payment
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Reference to the booked ride
    ride: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking', 
        required: true 
    },
    // Razorpay order ID generated during checkout initiation
    razorpayOrderId: { 
        type: String, 
        required: true 
    },
    // Razorpay payment ID received after successful payment
    razorpayPaymentId: { 
        type: String 
    },
    // Payment amount (stored in smallest currency unit, e.g., paise for INR)
    amount: { 
        type: Number, 
        required: true 
    },
    // Currency code
    currency: { 
        type: String, 
        default: 'INR' 
    },
    // Track the payment gateway status
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Paid', 'Verified', 'Failed'], 
        default: 'Pending' 
    },
    // Track the internal admin verification status
    adminVerification: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    }
}, { 
    // Automatically add createdAt and updatedAt fields
    timestamps: true 
});

module.exports = mongoose.model('Payment', paymentSchema);
