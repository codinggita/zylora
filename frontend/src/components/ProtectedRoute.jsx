import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role, buyerOnly }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) {
    // Redirect to login if there is no token
    return <Navigate to="/login" replace />;
  }

  if (role && (!user || user.role !== role)) {
    // User doesn't have the required role
    if (user && user.role === 'seller') {
      return <Navigate to="/seller-dashboard" replace />;
    }
    // Redirect buyers/others to home
    return <Navigate to="/" replace />;
  }

  // Only redirect sellers from routes explicitly marked as buyer-only
  if (buyerOnly && user && user.role === 'seller') {
    return <Navigate to="/seller-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

