import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    const { user, token } = useSelector((state) => state.auth);

    // Check if user is logged in
    if (!token || !user) {
        return <Navigate to="/login" />;
    }

    // Check if user is admin
    if (!user.isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;