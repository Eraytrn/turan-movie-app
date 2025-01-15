import React from 'react'
import { Navigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, adminOnly }) => {
    const { user, isAdmin } = UserAuth();

    if (!user) {
        return <Navigate to='/login' />
    }
 
    if (adminOnly && !isAdmin) {
        return <Navigate to='/' />
    }

    if (isAdmin && !adminOnly) {
        return <Navigate to='/admin' />
    }

    return children;
};
  
export default ProtectedRoute;