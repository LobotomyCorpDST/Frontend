import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? children : <Navigate to="/login" replace />;
}
