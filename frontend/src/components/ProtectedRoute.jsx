import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role, buyerOnly }) => {
  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user'));
  const location = useLocation();

  if (!token) {
    // Redirect to login if there is no token, passing current location in state
    return <Navigate to="/login" state={{ from: location }} replace />;
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

