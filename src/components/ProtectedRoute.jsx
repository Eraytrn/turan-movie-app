import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { verifyToken } from '../utils/auth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = UserAuth();
  const token = localStorage.getItem('authToken');
  
  if (!user || !token) {
    return <Navigate to='/login' />;
  }

  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    localStorage.removeItem('authToken');
    return <Navigate to='/login' />;
  }

  if (adminOnly && !decodedToken.isAdmin) {
    return <Navigate to='/' />;
  }

  return children;
};

export default ProtectedRoute; 