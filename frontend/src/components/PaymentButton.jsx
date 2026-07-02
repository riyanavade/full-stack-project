import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder, verifyPayment, resetPaymentState } from '../redux/paymentSlice';

const PaymentButton = ({ rideId, fare }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, currentOrder, error, success } = useSelector((state) => state.payment);

    // Load Razorpay Script dynamically
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Effect to trigger Razorpay modal when order is created successfully
    useEffect(() => {
        if (currentOrder && window.Razorpay) {
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID_HERE', // Needs to be added to frontend env
                amount: currentOrder.amount, // Amount is in paise
                currency: currentOrder.currency,
                name: 'Driver Tracking System',
                description: 'Ride Fare Payment',
                order_id: currentOrder.orderId,
                handler: function (response) {
                    // On success, verify the signature
                    const verificationData = {
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                    };
                    dispatch(verifyPayment(verificationData));
                },
                prefill: {
                    name: 'Test User',
                    email: 'test@example.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#3399cc'
                }
            };
            
            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function (response) {
                console.error('Payment Failed', response.error);
                navigate('/payment-failed');
            });

            rzp.open();
        }
    }, [currentOrder, dispatch, navigate]);

    // Handle verification success
    useEffect(() => {
        if (success) {
            dispatch(resetPaymentState());
            navigate('/payment-success');
        }
    }, [success, dispatch, navigate]);

    const handlePaymentClick = () => {
        if (rideId) {
            dispatch(createOrder(rideId));
        }
    };

    return (
        <div className="mt-4">
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <button 
                onClick={handlePaymentClick} 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 flex justify-center items-center"
            >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    `Proceed to Payment (₹${fare})`
                )}
            </button>
        </div>
    );
};

export default PaymentButton;
