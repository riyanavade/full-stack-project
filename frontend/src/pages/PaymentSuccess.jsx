import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center transform transition-all hover:scale-105">
                <div className="flex justify-center">
                    {/* Success Checkmark Animation */}
                    <svg className="w-24 h-24 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Payment Successful!
                </h2>
                
                <p className="mt-2 text-sm text-gray-600">
                    Your ride payment has been securely processed. A receipt has been generated.
                </p>

                <div className="mt-8 flex flex-col space-y-4">
                    <Link to="/user-dashboard" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Return to Dashboard
                    </Link>
                    <Link to="/payment-history" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        View Payment History
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
