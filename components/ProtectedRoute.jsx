// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  if (checking) return <div>Kiểm tra xác thực...</div>;
  return user ? children : <Navigate to={redirectTo} replace />;
}