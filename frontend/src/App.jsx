import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentHistory from './pages/PaymentHistory';
import AdminPaymentPage from './pages/AdminPaymentPage';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If not allowed, redirect to their appropriate dashboard
    return <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user-dashboard" element={
          <PrivateRoute allowedRoles={['passenger', 'driver']}>
            <UserDashboard />
          </PrivateRoute>
        } />
        <Route path="/payment-success" element={
          <PrivateRoute allowedRoles={['passenger', 'driver']}>
            <PaymentSuccess />
          </PrivateRoute>
        } />
        <Route path="/payment-failed" element={
          <PrivateRoute allowedRoles={['passenger', 'driver']}>
            <PaymentFailed />
          </PrivateRoute>
        } />
        <Route path="/payment-history" element={
          <PrivateRoute allowedRoles={['passenger', 'driver']}>
            <PaymentHistory />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/payments" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminPaymentPage />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
