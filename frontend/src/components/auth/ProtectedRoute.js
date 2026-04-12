import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useSelector(s => s.auth);
  const location = useLocation();
  
  // Check both Redux token and localStorage token
  const localToken = localStorage.getItem('token');
  if (!token && !localToken) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
