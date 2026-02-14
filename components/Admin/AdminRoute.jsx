// src/components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAdminCheck from '../../hooks/useAdminCheck';

const AdminRoute = ({ children }) => {
  const { user, isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return <div>Xin vui lòng chờ...</div>; // Hiển thị loading indicator
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;