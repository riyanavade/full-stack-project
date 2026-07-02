import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const AdminPaymentPage = () => {
    const { token } = useSelector((state) => state.auth);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/admin/payments', config);
            setPayments(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch payments');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [token]);

    const handleApproval = async (id, action) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (action === 'approve') {
                await axios.put(`/api/admin/payment/${id}/approve`, {}, config);
            } else {
                await axios.put(`/api/admin/payment/${id}/reject`, {}, config);
            }
            // Refresh list after action
            fetchPayments();
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Administration</h1>
                    <Link to="/admin-dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
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
                ) : payments.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                        No payments found in the system.
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ride ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.user?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.ride?._id || payment.ride}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ₹{payment.amount / 100}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.razorpayPaymentId || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    payment.adminVerification === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    payment.adminVerification === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {payment.adminVerification}
                                                </span>
                                                <br/>
                                                <span className="text-xs text-gray-400 mt-1 block">GW: {payment.paymentStatus}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {payment.adminVerification === 'Pending' && payment.paymentStatus !== 'Failed' && (
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => handleApproval(payment._id, 'approve')}
                                                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleApproval(payment._id, 'reject')}
                                                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPaymentPage;
