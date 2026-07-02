import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailed = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center transform transition-all hover:scale-105">
                <div className="flex justify-center">
                    {/* Failure X Animation */}
                    <svg className="w-24 h-24 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Payment Failed
                </h2>
                
                <p className="mt-2 text-sm text-gray-600">
                    We couldn't process your payment. Please check your payment details and try again.
                </p>

                <div className="mt-8">
                    <Link to="/user-dashboard" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Return to Dashboard to Retry
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
