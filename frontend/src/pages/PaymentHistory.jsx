import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentHistory } from '../redux/paymentSlice';
import { Link } from 'react-router-dom';

const PaymentHistory = () => {
    const dispatch = useDispatch();
    const { history, loading, error } = useSelector((state) => state.payment);

    useEffect(() => {
        dispatch(fetchPaymentHistory());
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                    <Link to="/user-dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                ) : history.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                        No payments found.
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {history.map((payment) => (
                                <li key={payment._id}>
                                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-blue-600 truncate">
                                                Order ID: {payment.razorpayOrderId}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    payment.paymentStatus === 'Paid' || payment.paymentStatus === 'Verified' ? 'bg-green-100 text-green-800' : 
                                                    payment.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {payment.paymentStatus}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Amount: ₹{payment.amount / 100} {/* Convert paise back to rupees */}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    Ride ID: {payment.ride?._id || payment.ride}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    Date: {new Date(payment.createdAt).toLocaleDateString()} {new Date(payment.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
