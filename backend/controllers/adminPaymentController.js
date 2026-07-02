const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments
 * @access  Private (Admin)
 */
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email') // Fetch basic user info
            .populate('ride')
            .sort({ createdAt: -1 });

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @route   PUT /api/admin/payment/:id/approve
 * @desc    Approve a payment manually
 * @access  Private (Admin)
 */
exports.approvePayment = async (req, res) => {
    try {
        const paymentId = req.params.id;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Update payment status
        payment.adminVerification = 'Approved';
        payment.paymentStatus = 'Verified'; // Optional depending on flow, usually verified means completely clear
        await payment.save();

        // Update the associated ride status
        await Booking.findByIdAndUpdate(payment.ride, { status: 'completed' });

        // TODO: In a complete real-time app, emit a socket event here to notify the user
        // io.to(payment.user.toString()).emit('payment_approved', { message: 'Payment Verified Successfully' });

        res.status(200).json({ 
            message: 'Payment Verified Successfully',
            payment 
        });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @route   PUT /api/admin/payment/:id/reject
 * @desc    Reject a payment manually
 * @access  Private (Admin)
 */
exports.rejectPayment = async (req, res) => {
    try {
        const paymentId = req.params.id;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Update payment status
        payment.adminVerification = 'Rejected';
        await payment.save();

        // TODO: Emit socket event to notify the user
        // io.to(payment.user.toString()).emit('payment_rejected', { message: 'Payment Verification Failed' });

        res.status(200).json({ 
            message: 'Payment Verification Failed',
            payment 
        });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
